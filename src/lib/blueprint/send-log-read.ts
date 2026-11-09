// Blueprint email automation: send_log row types and read-only queries (spec 10.3).
// Writes live in send-log.ts; this module never changes a row.

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { DbError, type FailedStep } from "./errors";

export type SendLogStatus =
  | "pending" | "processing" | "retry_scheduled" | "awaiting_approval"
  | "approved" | "rejected" | "expired" | "sent"
  | "failed_permanent" | "failed_exhausted";
export type SendLogStage = "prepare" | "send";

export interface SendLogRow {
  id: string;
  clickup_task_id: string;
  status_change_id: string;
  status: SendLogStatus;
  stage: SendLogStage;
  attempt_count: number;
  next_retry_at: string | null;
  previous_clickup_status: string | null;
  company_name: string | null;
  client_email: string | null;
  drive_file_id: string | null;
  drive_filename: string | null;
  approved_md5: string | null;
  drive_modified_time: string | null;
  slack_channel_id: string | null;
  slack_message_ts: string | null;
  approval_expires_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  last_error_code: string | null;
  last_error_message: string | null;
  failed_step: FailedStep | null;
  resend_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export const SEND_LOG_TABLE = "send_log";

/** Throws a DbError; pipeline code turns it into a transient PipelineError via toPipelineError. */
export function failQuery(op: string, error: PostgrestError): never {
  const code = error.code ?? "unknown";
  throw new DbError(op, code, `send_log.${op} failed: ${code} ${error.message}`);
}

export function createSendLogReads(db: SupabaseClient) {
  return {
    async getById(id: string): Promise<SendLogRow | null> {
      const { data, error } = await db.from(SEND_LOG_TABLE).select("*").eq("id", id).maybeSingle();
      if (error) failQuery("getById", error);
      return (data as SendLogRow | null) ?? null;
    },

    /** Preflight check 1: true if any row for this task reached `sent`. */
    async hasSentRow(taskId: string): Promise<boolean> {
      const { data, error } = await db
        .from(SEND_LOG_TABLE)
        .select("id")
        .eq("clickup_task_id", taskId)
        .eq("status", "sent")
        .limit(1);
      if (error) failQuery("hasSentRow", error);
      return (data?.length ?? 0) > 0;
    },
  };
}

export type SendLogReads = ReturnType<typeof createSendLogReads>;
