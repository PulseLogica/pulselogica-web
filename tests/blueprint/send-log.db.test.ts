// DB tests for send_log against a LOCAL Supabase only. Gated behind BLUEPRINT_DB_TEST=1.
//
//   supabase start
//   BLUEPRINT_DB_TEST=1 \
//   BLUEPRINT_DB_TEST_SUPABASE_URL=http://127.0.0.1:55321 \
//   BLUEPRINT_DB_TEST_SERVICE_KEY=<local secret key from `supabase status`> \
//   BLUEPRINT_DB_TEST_PG_URL=postgresql://postgres:postgres@127.0.0.1:55322/postgres \
//   bun test tests/blueprint
//
// The suite refuses to run against any non-local host.

import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { SQL } from "bun";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PipelineError } from "@/lib/blueprint/errors";
import { createSendLog, type ApprovalFields, type SendLog, type SendLogRow } from "@/lib/blueprint/send-log";

const enabled = process.env.BLUEPRINT_DB_TEST === "1";
const supabaseUrl = process.env.BLUEPRINT_DB_TEST_SUPABASE_URL ?? "";
const serviceKey = process.env.BLUEPRINT_DB_TEST_SERVICE_KEY ?? "";
const pgUrl = process.env.BLUEPRINT_DB_TEST_PG_URL ?? "";

if (!enabled) {
  console.warn("[send-log.db.test] skipped: set BLUEPRINT_DB_TEST=1 with a local Supabase to run DB tests.");
}

function assertLocal(url: string, name: string): void {
  const host = new URL(url).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`${name} must point at a local Supabase (got host ${host}). Refusing to run.`);
  }
}

const HOUR = 60 * 60 * 1000;
const fields: ApprovalFields = {
  company_name: "Acme",
  client_email: "client@example.com",
  drive_file_id: "file-1",
  drive_filename: "Acme_Operational_Blueprint_Locked.pdf",
  approved_md5: "abc123",
  drive_modified_time: "2026-11-09T00:00:00.000Z",
  slack_channel_id: "C_APPROVALS",
  slack_message_ts: "1700000000.000100",
};

describe.skipIf(!enabled)("send_log (local Supabase)", () => {
  let db: SupabaseClient;
  let sql: SQL;
  let store: SendLog;

  beforeAll(() => {
    assertLocal(supabaseUrl, "BLUEPRINT_DB_TEST_SUPABASE_URL");
    assertLocal(pgUrl, "BLUEPRINT_DB_TEST_PG_URL");
    db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    sql = new SQL(pgUrl);
    store = createSendLog(db);
  });

  afterAll(async () => {
    await sql`truncate public.send_log`;
    await sql.close();
  });

  beforeEach(async () => {
    await sql`truncate public.send_log`;
  });

  async function insertRow(status: string, extra: Record<string, unknown> = {}): Promise<SendLogRow> {
    const row = { clickup_task_id: `task-${crypto.randomUUID()}`, status_change_id: crypto.randomUUID(), status, ...extra };
    const [inserted] = await sql`insert into public.send_log ${sql(row)} returning *`;
    return inserted as SendLogRow;
  }

  /** Bun SQL queries are lazy thenables; wrap them in a real Promise for expect().rejects. */
  async function run(query: PromiseLike<unknown>): Promise<void> {
    await query;
  }

  async function statusOf(id: string): Promise<string> {
    const [row] = await sql`select status from public.send_log where id = ${id}`;
    return row.status as string;
  }

  /** Puts a row into awaiting_approval through the store, with a chosen clock. */
  async function awaitingRow(nowMs = Date.now()): Promise<SendLogRow> {
    const row = await insertRow("processing");
    const marked = await createSendLog(db, () => new Date(nowMs)).markAwaitingApproval(row.id, fields);
    expect(marked?.status).toBe("awaiting_approval");
    return marked as SendLogRow;
  }

  test("insertIfNew inserts once and returns null on duplicate", async () => {
    const first = await store.insertIfNew("task-1", "change-1", "In Review");
    expect(first).toMatchObject({ status: "pending", stage: "prepare", attempt_count: 0, previous_clickup_status: "In Review" });
    expect(await store.insertIfNew("task-1", "change-1", "In Review")).toBeNull();
    const again = await store.insertIfNew("task-1", "change-2", "In Review");
    expect(again?.id).not.toBe(first?.id);
    const [{ count }] = await sql`select count(*)::int as count from public.send_log where clickup_task_id = 'task-1'`;
    expect(count).toBe(2);
  });

  test("attempt_count check constraint rejects values outside 0..3", async () => {
    const row = await insertRow("processing");
    await expect(run(sql`update public.send_log set attempt_count = 4 where id = ${row.id}`)).rejects.toThrow(/attempt_count_check/);
    await expect(run(sql`update public.send_log set attempt_count = -1 where id = ${row.id}`)).rejects.toThrow(/attempt_count_check/);
    await sql`update public.send_log set attempt_count = 3 where id = ${row.id}`;
  });

  test("updated_at trigger bumps updated_at on update", async () => {
    const row = await insertRow("pending", { updated_at: new Date(Date.now() - HOUR) });
    await sql`update public.send_log set company_name = 'X' where id = ${row.id}`;
    const [after] = await sql`select updated_at from public.send_log where id = ${row.id}`;
    expect(new Date(after.updated_at).getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  test("markAwaitingApproval sets fields, 24h expiry and resets attempts", async () => {
    const row = await insertRow("processing", { attempt_count: 2 });
    const t = Date.parse("2030-01-01T00:00:00.000Z");
    const marked = await createSendLog(db, () => new Date(t)).markAwaitingApproval(row.id, fields);
    expect(marked).toMatchObject({ ...fields, status: "awaiting_approval", attempt_count: 0 });
    expect(Date.parse(marked!.approval_expires_at!)).toBe(t + 24 * HOUR);
    expect(await store.markAwaitingApproval(row.id, fields)).toBeNull();
  });

  test("approve succeeds once from awaiting_approval; second call is a no-op", async () => {
    const row = await awaitingRow();
    const approved = await store.approve(row.id, "U_KEVIN");
    expect(approved).toMatchObject({ status: "approved", stage: "send", attempt_count: 0, approved_by: "U_KEVIN" });
    expect(approved?.approved_at).not.toBeNull();
    expect(await store.approve(row.id, "U_OTHER")).toBeNull();
    const [after] = await sql`select approved_by from public.send_log where id = ${row.id}`;
    expect(after.approved_by).toBe("U_KEVIN");
  });

  test("approve refuses rows not awaiting approval", async () => {
    for (const status of ["pending", "processing", "rejected", "sent", "expired"]) {
      const row = await insertRow(status, { approval_expires_at: new Date(Date.now() + HOUR) });
      expect(await store.approve(row.id, "U_KEVIN")).toBeNull();
      expect(await statusOf(row.id)).toBe(status);
    }
  });

  test("approve and reject refuse an expired approval", async () => {
    const row = await awaitingRow(Date.now() - 25 * HOUR);
    expect(await store.approve(row.id, "U_KEVIN")).toBeNull();
    expect(await store.reject(row.id, "U_KEVIN")).toBeNull();
    expect(await statusOf(row.id)).toBe("awaiting_approval");
  });

  test("reject uses the same guard and is a no-op after approve", async () => {
    const a = await awaitingRow();
    expect((await store.reject(a.id, "U_KEVIN"))?.status).toBe("rejected");
    expect(await store.reject(a.id, "U_KEVIN")).toBeNull();
    const b = await awaitingRow();
    await store.approve(b.id, "U_KEVIN");
    expect(await store.reject(b.id, "U_KEVIN")).toBeNull();
    expect(await statusOf(b.id)).toBe("approved");
  });

  test("concurrent approve clicks: exactly one wins", async () => {
    const row = await awaitingRow();
    const results = await Promise.all([store.approve(row.id, "U_KEVIN"), store.approve(row.id, "U_KEVIN")]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  test("claimForSend claims an approved row exactly once", async () => {
    const row = await awaitingRow();
    await store.approve(row.id, "U_KEVIN");
    const results = await Promise.all([store.claimForSend(row.id), store.claimForSend(row.id)]);
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await store.claimForSend(row.id)).toBeNull();
    expect(await statusOf(row.id)).toBe("processing");
    const pending = await insertRow("pending");
    expect(await store.claimForSend(pending.id)).toBeNull();
  });

  test("claimDue claims only due retry rows, in next_retry_at order, up to batch size", async () => {
    const past = (min: number) => new Date(Date.now() - min * 60_000);
    const old = await insertRow("retry_scheduled", { next_retry_at: past(3) });
    const mid = await insertRow("retry_scheduled", { next_retry_at: past(2) });
    await insertRow("retry_scheduled", { next_retry_at: past(1) });
    const future = await insertRow("retry_scheduled", { next_retry_at: new Date(Date.now() + HOUR) });
    const other = await insertRow("approved", { next_retry_at: past(5) });
    const claimed = await store.claimDue(2);
    expect(claimed.map((r) => r.id)).toEqual([old.id, mid.id]);
    expect(claimed.every((r) => r.status === "processing")).toBe(true);
    expect(await statusOf(future.id)).toBe("retry_scheduled");
    expect(await statusOf(other.id)).toBe("approved");
  });

  test("two concurrent claimDue calls claim each row once", async () => {
    const ids: string[] = [];
    for (let i = 0; i < 12; i++) {
      ids.push((await insertRow("retry_scheduled", { next_retry_at: new Date(Date.now() - (i + 1) * 1000) })).id);
    }
    const [a, b] = await Promise.all([store.claimDue(10), store.claimDue(10)]);
    const claimed = [...a, ...b].map((r) => r.id);
    expect(new Set(claimed).size).toBe(claimed.length);
    expect(claimed.sort()).toEqual([...ids].sort());
  });

  test("claimDue skips rows locked by an in-flight claim (SKIP LOCKED)", async () => {
    for (let i = 0; i < 4; i++) {
      await insertRow("retry_scheduled", { next_retry_at: new Date(Date.now() - (i + 1) * 1000) });
    }
    let first: SendLogRow[] = [];
    let second: SendLogRow[] = [];
    await sql.begin(async (tx) => {
      first = (await tx`select * from public.claim_due_send_logs(2)`) as SendLogRow[];
      // Transaction still open: the two claimed rows stay locked while another caller claims.
      second = await store.claimDue(10);
    });
    expect(first).toHaveLength(2);
    expect(second).toHaveLength(2);
    const overlap = second.filter((r) => first.some((f) => f.id === r.id));
    expect(overlap).toHaveLength(0);
  });

  test("resetStuck requeues only processing rows idle for more than 5 minutes", async () => {
    const stuck = await insertRow("processing");
    const fresh = await insertRow("processing");
    const waiting = await insertRow("awaiting_approval");
    await sql.begin(async (tx) => {
      await tx`alter table public.send_log disable trigger send_log_updated_at`;
      await tx`update public.send_log set updated_at = now() - interval '6 minutes' where id in ${sql([stuck.id, waiting.id])}`;
      await tx`update public.send_log set updated_at = now() - interval '1 minute' where id = ${fresh.id}`;
      await tx`alter table public.send_log enable trigger send_log_updated_at`;
    });
    expect(await store.resetStuck()).toBe(1);
    const [row] = await sql`select status, next_retry_at <= now() as due from public.send_log where id = ${stuck.id}`;
    expect(row).toEqual({ status: "retry_scheduled", due: true });
    expect(await statusOf(fresh.id)).toBe("processing");
    expect(await statusOf(waiting.id)).toBe("awaiting_approval");
    expect(await store.resetStuck()).toBe(0);
  });

  test("expireStale expires only past-due approvals and returns them once", async () => {
    const stale = await awaitingRow(Date.now() - 25 * HOUR);
    const live = await awaitingRow();
    const expired = await store.expireStale();
    expect(expired.map((r) => r.id)).toEqual([stale.id]);
    expect(expired[0].status).toBe("expired");
    expect(await statusOf(live.id)).toBe("awaiting_approval");
    expect(await store.expireStale()).toEqual([]);
  });

  test("recordFailure: transient retries with backoff, then exhausts at attempt 3", async () => {
    const row = await insertRow("processing");
    const err = new PipelineError("transient", "HTTP_503", "resend_send", "service unavailable for client@example.com");
    const start = Date.now();

    expect(await store.recordFailure(row.id, err)).toBe("retry");
    let [r] = await sql`select * from public.send_log where id = ${row.id}`;
    expect(r).toMatchObject({ status: "retry_scheduled", attempt_count: 1, last_error_code: "HTTP_503", failed_step: "resend_send" });
    expect(r.last_error_message).toBe("service unavailable for c***@example.com");
    expect(new Date(r.next_retry_at).getTime() - start).toBeGreaterThanOrEqual(29_000);

    await sql`update public.send_log set status = 'processing' where id = ${row.id}`;
    expect(await store.recordFailure(row.id, err)).toBe("retry");
    [r] = await sql`select * from public.send_log where id = ${row.id}`;
    expect(r.attempt_count).toBe(2);
    expect(new Date(r.next_retry_at).getTime() - start).toBeGreaterThanOrEqual(119_000);

    await sql`update public.send_log set status = 'processing' where id = ${row.id}`;
    expect(await store.recordFailure(row.id, err)).toBe("terminal");
    [r] = await sql`select * from public.send_log where id = ${row.id}`;
    expect(r).toMatchObject({ status: "failed_exhausted", attempt_count: 3, next_retry_at: null });
  });

  test("recordFailure: permanent and auth are terminal on attempt 1", async () => {
    for (const kind of ["permanent", "auth"] as const) {
      const row = await insertRow("processing");
      expect(await store.recordFailure(row.id, new PipelineError(kind, "X", "drive_download"))).toBe("terminal");
      const [r] = await sql`select status, attempt_count from public.send_log where id = ${row.id}`;
      expect(r).toEqual({ status: "failed_permanent", attempt_count: 1 });
    }
  });

  test("recordFailure: no-op (null) when the row is not processing or missing", async () => {
    const row = await insertRow("sent");
    const err = new PipelineError("transient", "HTTP_503", "resend_send");
    expect(await store.recordFailure(row.id, err)).toBeNull();
    expect(await statusOf(row.id)).toBe("sent");
    expect(await store.recordFailure(crypto.randomUUID(), err)).toBeNull();
  });

  test("markSent moves processing to sent once", async () => {
    const row = await insertRow("processing");
    expect(await store.markSent(row.id, "re_123")).toMatchObject({ status: "sent", resend_message_id: "re_123" });
    expect(await store.markSent(row.id, "re_456")).toBeNull();
  });
});
