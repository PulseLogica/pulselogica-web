// Blueprint email automation: every send_log read and write (spec 10.3, section 11).
// State changes are single conditional UPDATEs, so a guard that does not match is a no-op.

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase";
import { APPROVAL_TTL_MS, MAX_ATTEMPTS, RETRY_DELAYS_MS } from "./config";
import type { ErrorKind, PipelineError } from "./errors";
import { redactEmails } from "./log";
import {
  createSendLogReads,
  failQuery as fail,
  SEND_LOG_TABLE as TABLE,
  type SendLogRow,
  type SendLogStatus,
} from "./send-log-read";

export type { SendLogRow, SendLogStage, SendLogStatus } from "./send-log-read";

export type ApprovalFields = Pick<
  SendLogRow,
  | "company_name" | "client_email" | "drive_file_id" | "drive_filename" | "approved_md5"
  | "drive_modified_time" | "slack_channel_id" | "slack_message_ts"
>;

export type FailureDecision = "terminal" | "retry";

export interface FailureUpdate {
  decision: FailureDecision;
  status: Extract<SendLogStatus, "retry_scheduled" | "failed_permanent" | "failed_exhausted">;
  attempt_count: number;
  next_retry_at: string | null;
}

const UNIQUE_VIOLATION = "23505";
const MAX_ERROR_MESSAGE = 500;

/** Pure retry rules from section 11. `attemptsBefore` is the stored attempt_count. */
export function decideFailure(kind: ErrorKind, attemptsBefore: number, now: Date): FailureUpdate {
  const attempt_count = Math.min(attemptsBefore + 1, MAX_ATTEMPTS);
  if (kind === "permanent" || kind === "auth") {
    return { decision: "terminal", status: "failed_permanent", attempt_count, next_retry_at: null };
  }
  if (attempt_count >= MAX_ATTEMPTS) {
    return { decision: "terminal", status: "failed_exhausted", attempt_count, next_retry_at: null };
  }
  const delay = RETRY_DELAYS_MS[attempt_count - 1];
  return {
    decision: "retry",
    status: "retry_scheduled",
    attempt_count,
    next_retry_at: new Date(now.getTime() + delay).toISOString(),
  };
}

export function createSendLog(db: SupabaseClient, now: () => Date = () => new Date()) {
  const iso = () => now().toISOString();
  const reads = createSendLogReads(db);
  const { getById } = reads;

  async function one(op: string, query: PromiseLike<{ data: unknown; error: PostgrestError | null }>) {
    const { data, error } = await query;
    if (error) fail(op, error);
    return (data as SendLogRow | null) ?? null;
  }

  return {
    ...reads,

    /** Inserts a pending row. Returns null if this (task, status change) already exists. */
    async insertIfNew(taskId: string, changeId: string, previousStatus: string | null) {
      const { data, error } = await db
        .from(TABLE)
        .insert({ clickup_task_id: taskId, status_change_id: changeId, previous_clickup_status: previousStatus, status: "pending" })
        .select("*")
        .single();
      if (error?.code === UNIQUE_VIOLATION) return null;
      if (error) fail("insertIfNew", error);
      return data as SendLogRow;
    },

    /** pending | retry_scheduled -> processing, prepare stage only. Null means not claimable. */
    async claimForPrepare(id: string) {
      return one("claimForPrepare", db.from(TABLE)
        .update({ status: "processing" })
        .eq("id", id).in("status", ["pending", "retry_scheduled"]).eq("stage", "prepare")
        .select("*").maybeSingle());
    },

    /** processing -> awaiting_approval, with a fresh 24h expiry and attempt counter. */
    async markAwaitingApproval(id: string, fields: ApprovalFields) {
      const expires = new Date(now().getTime() + APPROVAL_TTL_MS).toISOString();
      return one("markAwaitingApproval", db.from(TABLE)
        .update({ ...fields, status: "awaiting_approval", approval_expires_at: expires, attempt_count: 0, next_retry_at: null })
        .eq("id", id).eq("status", "processing")
        .select("*").maybeSingle());
    },

    /** awaiting_approval (not expired) -> approved. Null means duplicate click or expired. */
    async approve(id: string, slackUserId: string) {
      return one("approve", db.from(TABLE)
        .update({ status: "approved", stage: "send", attempt_count: 0, approved_by: slackUserId, approved_at: iso() })
        .eq("id", id).eq("status", "awaiting_approval").gt("approval_expires_at", iso())
        .select("*").maybeSingle());
    },

    /** awaiting_approval (not expired) -> rejected. The schema has no rejected_by column. */
    async reject(id: string, _slackUserId: string) {
      return one("reject", db.from(TABLE)
        .update({ status: "rejected" })
        .eq("id", id).eq("status", "awaiting_approval").gt("approval_expires_at", iso())
        .select("*").maybeSingle());
    },

    /** approved -> processing. Null means another caller already claimed it. */
    async claimForSend(id: string) {
      return one("claimForSend", db.from(TABLE)
        .update({ status: "processing" })
        .eq("id", id).eq("status", "approved")
        .select("*").maybeSingle());
    },

    /**
     * Applies section 11 to a processing row. Returns null when the row is missing,
     * not processing, or changed concurrently (nothing written).
     */
    async recordFailure(id: string, err: PipelineError): Promise<FailureDecision | null> {
      const row = await getById(id);
      if (!row || row.status !== "processing") return null;
      const next = decideFailure(err.kind, row.attempt_count, now());
      const updated = await one("recordFailure", db.from(TABLE)
        .update({
          status: next.status,
          attempt_count: next.attempt_count,
          next_retry_at: next.next_retry_at,
          last_error_code: err.code,
          last_error_message: redactEmails(err.message).slice(0, MAX_ERROR_MESSAGE),
          failed_step: err.step,
        })
        .eq("id", id).eq("status", "processing").eq("attempt_count", row.attempt_count)
        .select("id").maybeSingle());
      return updated ? next.decision : null;
    },

    /** processing -> sent. */
    async markSent(id: string, resendId: string) {
      return one("markSent", db.from(TABLE)
        .update({ status: "sent", resend_message_id: resendId, next_retry_at: null })
        .eq("id", id).eq("status", "processing")
        .select("*").maybeSingle());
    },

    /** Claims due retry rows via claim_due_send_logs (SKIP LOCKED). */
    async claimDue(batchSize = 10): Promise<SendLogRow[]> {
      const { data, error } = await db.rpc("claim_due_send_logs", { batch_size: batchSize });
      if (error) fail("claimDue", error);
      return (data as SendLogRow[] | null) ?? [];
    },

    /** Returns rows stuck in processing for over 5 minutes to the retry queue. */
    async resetStuck(): Promise<number> {
      const { data, error } = await db.rpc("reset_stuck_send_logs");
      if (error) fail("resetStuck", error);
      return Number(data ?? 0);
    },

    /** awaiting_approval past expiry -> expired. Returns the rows that changed. */
    async expireStale(): Promise<SendLogRow[]> {
      const { data, error } = await db.from(TABLE)
        .update({ status: "expired" })
        .eq("status", "awaiting_approval").lte("approval_expires_at", iso())
        .select("*");
      if (error) fail("expireStale", error);
      return (data as SendLogRow[] | null) ?? [];
    },
  };
}

export type SendLog = ReturnType<typeof createSendLog>;

let defaultStore: SendLog | null = null;

/** Default store on the server Supabase client (service role), created on first use. */
export function getSendLog(): SendLog {
  if (!defaultStore) defaultStore = createSendLog(getSupabaseServerClient());
  return defaultStore;
}
