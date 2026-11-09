import { describe, expect, test } from "bun:test";
import type { BlueprintTask } from "@/lib/blueprint/clickup";
import type { DriveFile } from "@/lib/blueprint/drive";
import { DbError, PipelineError } from "@/lib/blueprint/errors";
import {
  buildTemplateVariables,
  checkFile,
  checkTask,
  clientFacingFilename,
  runPreflight,
  sanitizeTag,
  type SentRowReader,
} from "@/lib/blueprint/preflight";
import { fakeConfig } from "./helpers";

const task: BlueprintTask = {
  id: "task-1",
  url: "https://app.clickup.com/t/task-1",
  status: "Ready to Send",
  dateUpdated: "1762646400000",
  clientName: "Ana Cruz",
  clientEmail: "ana@example.com",
  companyName: "Acme Corp",
  blueprintScore: "72",
  track: "Growth",
  criticalDimensions: 3,
};

const file: DriveFile = {
  id: "pdf-1",
  name: "Acme Corp_Operational_Blueprint_Locked.pdf",
  mimeType: "application/pdf",
  size: 2048,
  md5Checksum: "abc",
  modifiedTime: "2026-11-09T00:00:00.000Z",
};

const notSent: SentRowReader = { hasSentRow: async () => false };
const alreadySent: SentRowReader = { hasSentRow: async () => true };

async function caught(promise: Promise<unknown>): Promise<PipelineError> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof PipelineError) return err;
    throw err;
  }
  throw new Error("expected a PipelineError");
}

const caughtSync = (fn: () => unknown): Promise<PipelineError> => caught(Promise.resolve().then(fn));

describe("checkTask (checks 1-3)", () => {
  test("passes a complete task", async () => {
    expect(await checkTask(task, notSent)).toMatchObject({ clientEmail: "ana@example.com", companyName: "Acme Corp" });
  });

  test("already-sent task fails ALREADY_SENT before any field check", async () => {
    const err = await caught(checkTask({ ...task, clientEmail: undefined }, alreadySent));
    expect(err).toMatchObject({ kind: "permanent", code: "ALREADY_SENT", step: "preflight" });
  });

  test("a send_log read failure becomes a transient preflight error", async () => {
    const broken: SentRowReader = { hasSentRow: async () => { throw new DbError("hasSentRow", "57014", "send_log.hasSentRow failed"); } };
    expect(await caught(checkTask(task, broken))).toMatchObject({ kind: "transient", code: "DB_ERROR", step: "preflight" });
  });

  test("missing email is MISSING_FIELD:Client Email", async () => {
    expect(await caught(checkTask({ ...task, clientEmail: undefined }, notSent))).toMatchObject({
      kind: "permanent", code: "MISSING_FIELD:Client Email",
    });
  });

  test.each(["ana", "ana@", "ana@example", "ana cruz@example.com", "a@b@c.com"])("invalid email %p is INVALID_EMAIL", async (email) => {
    const err = await caught(checkTask({ ...task, clientEmail: email }, notSent));
    expect(err).toMatchObject({ kind: "permanent", code: "INVALID_EMAIL" });
    expect(err.message).not.toContain(email);
  });

  test("email is checked before template fields", async () => {
    const err = await caught(checkTask({ ...task, clientEmail: undefined, clientName: undefined }, notSent));
    expect(err.code).toBe("MISSING_FIELD:Client Email");
  });

  test.each([
    ["clientName", "Client Name"],
    ["companyName", "Company Name"],
    ["blueprintScore", "Blueprint Score"],
    ["track", "Track"],
    ["criticalDimensions", "Critical Dimensions"],
  ] as const)("missing %s is MISSING_FIELD:%s", async (key, name) => {
    const err = await caught(checkTask({ ...task, [key]: undefined }, notSent));
    expect(err).toMatchObject({ kind: "permanent", code: `MISSING_FIELD:${name}`, step: "preflight" });
  });

  test("blank string variable counts as missing", async () => {
    expect((await caught(checkTask({ ...task, clientName: "   " }, notSent))).code).toBe("MISSING_FIELD:Client Name");
  });
});

describe("checkFile (check 5)", () => {
  test("accepts a PDF above 0 bytes and under 30MB", () => {
    expect(checkFile(file)).toBe(file);
    expect(checkFile({ ...file, size: 29_999_999 }).size).toBe(29_999_999);
    expect(checkFile({ ...file, size: 1 }).size).toBe(1);
  });

  test.each([
    ["not a PDF", { mimeType: "application/vnd.google-apps.document" }],
    ["empty", { size: 0 }],
    ["exactly 30MB", { size: 30_000_000 }],
    ["over 30MB", { size: 31_000_000 }],
  ])("%s is DRIVE_BAD_FILE", async (_label, patch) => {
    const err = await caughtSync(() => checkFile({ ...file, ...patch } as DriveFile));
    expect(err).toMatchObject({ kind: "permanent", code: "DRIVE_BAD_FILE", step: "preflight" });
  });
});

describe("runPreflight order", () => {
  test("a field failure never calls Drive", async () => {
    let driveCalls = 0;
    const err = await caught(runPreflight({ ...task, track: undefined }, {
      sendLog: notSent,
      findLockedBlueprint: async () => { driveCalls++; return file; },
    }));
    expect(err.code).toBe("MISSING_FIELD:Track");
    expect(driveCalls).toBe(0);
  });

  test("Drive errors propagate unchanged, then the file is checked", async () => {
    const noMatch = new PipelineError("permanent", "DRIVE_NO_MATCH", "drive_lookup");
    expect(await caught(runPreflight(task, { sendLog: notSent, findLockedBlueprint: async () => { throw noMatch; } }))).toBe(noMatch);
    const bad = await caught(runPreflight(task, { sendLog: notSent, findLockedBlueprint: async () => ({ ...file, size: 0 }) }));
    expect(bad.code).toBe("DRIVE_BAD_FILE");
  });

  test("passes the trimmed company name to Drive and returns task and file", async () => {
    let asked = "";
    const out = await runPreflight(task, { sendLog: notSent, findLockedBlueprint: async (c) => { asked = c; return file; } });
    expect(asked).toBe("Acme Corp");
    expect(out.file).toBe(file);
  });
});

describe("buildTemplateVariables", () => {
  test("maps task fields and config, without UNLOCK_URL", async () => {
    const vars = buildTemplateVariables(await checkTask(task, notSent), fakeConfig());
    expect(vars).toEqual({
      CLIENT_NAME: "Ana Cruz",
      COMPANY_NAME: "Acme Corp",
      BLUEPRINT_SCORE: "72",
      TRACK: "Growth",
      CRITICAL_DIMENSIONS: 3,
      SENDER_NAME: "Kevin",
      BOOKING_URL: "https://example.com/book",
    });
    expect(vars).not.toHaveProperty("UNLOCK_URL");
  });
});

describe("clientFacingFilename", () => {
  test.each([
    ["Acme Corp", "PulseLogica_Operational_Blueprint_Acme Corp_Locked.pdf"],
    ["A/B: \"Co\" <x>|*?\\", "PulseLogica_Operational_Blueprint_AB Co x_Locked.pdf"],
    ["  Tab\tCo\n ", "PulseLogica_Operational_Blueprint_TabCo_Locked.pdf"],
    ["Dela Cruz & Sons, Inc.", "PulseLogica_Operational_Blueprint_Dela Cruz & Sons, Inc._Locked.pdf"],
  ])("%p -> %p", (company, expected) => {
    expect(clientFacingFilename(company)).toBe(expected);
  });
});

describe("sanitizeTag", () => {
  test("keeps ASCII letters, digits, underscore and dash", () => {
    expect(sanitizeTag("abc-DEF_123")).toBe("abc-DEF_123");
  });

  test("replaces anything else with underscore and caps at 256 chars", () => {
    expect(sanitizeTag("86abc 12/x.y@é")).toBe("86abc_12_x_y__");
    expect(sanitizeTag("a".repeat(300))).toHaveLength(256);
  });
});
