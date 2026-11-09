// Blueprint email automation: preflight checks and template inputs (spec sections 8 and 9).
//
// Order (first failure wins), split so a bad task never costs a Drive walk:
//   checkTask(task, sendLog)            checks 1-3: ALREADY_SENT, Client Email, template fields
//   drive.findLockedBlueprint(company)  check 4:    DRIVE_NO_MATCH / DRIVE_MULTI_MATCH (drive.ts)
//   checkFile(file)                     check 5:    DRIVE_BAD_FILE
// runPreflight() runs all three in that order. Every failure here is permanent.

import type { BlueprintTask } from "./clickup";
import { CLICKUP_FIELDS, MAX_PDF_BYTES, PDF_MIME_TYPE, type BlueprintConfig } from "./config";
import type { DriveFile } from "./drive";
import { PipelineError } from "./errors";

/** A task that passed checks 1-3: every template field is present. */
export type CheckedTask = BlueprintTask &
  Required<Pick<BlueprintTask, "clientEmail" | "clientName" | "companyName" | "blueprintScore" | "track" | "criticalDimensions">>;

export interface SentRowReader {
  hasSentRow(taskId: string): Promise<boolean>;
}

export interface TemplateVariables {
  CLIENT_NAME: string;
  COMPANY_NAME: string;
  BLUEPRINT_SCORE: string;
  TRACK: string;
  CRITICAL_DIMENSIONS: number;
  SENDER_NAME: string;
  BOOKING_URL: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

/** Required template fields from the task, in the order they are checked. */
const REQUIRED_FIELDS = [
  ["clientName", CLICKUP_FIELDS.clientName],
  ["companyName", CLICKUP_FIELDS.companyName],
  ["blueprintScore", CLICKUP_FIELDS.blueprintScore],
  ["track", CLICKUP_FIELDS.track],
  ["criticalDimensions", CLICKUP_FIELDS.criticalDimensions],
] as const satisfies readonly (readonly [keyof BlueprintTask, string])[];

const fail = (code: string, message?: string): never => {
  throw new PipelineError("permanent", code, "preflight", message);
};

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

/** Checks 1-3. Run before any Drive call. */
export async function checkTask(task: BlueprintTask, sendLog: SentRowReader): Promise<CheckedTask> {
  if (await sendLog.hasSentRow(task.id)) fail("ALREADY_SENT", "A Blueprint was already sent for this task");

  const email = task.clientEmail?.trim();
  if (!email) fail(`MISSING_FIELD:${CLICKUP_FIELDS.clientEmail}`);
  else if (!isValidEmail(email)) fail("INVALID_EMAIL", "Client Email is not a valid address");

  for (const [key, name] of REQUIRED_FIELDS) {
    const value = task[key];
    if (value === undefined || (typeof value === "string" && value.trim() === "")) fail(`MISSING_FIELD:${name}`);
  }
  return { ...task, clientEmail: email } as CheckedTask;
}

/** Check 5: a non-empty PDF under 30MB. */
export function checkFile(file: DriveFile): DriveFile {
  if (file.mimeType !== PDF_MIME_TYPE) fail("DRIVE_BAD_FILE", `File type is ${file.mimeType || "unknown"}, not PDF`);
  if (!(file.size > 0)) fail("DRIVE_BAD_FILE", "File is empty");
  if (file.size >= MAX_PDF_BYTES) fail("DRIVE_BAD_FILE", `File is ${file.size} bytes, limit is under ${MAX_PDF_BYTES}`);
  return file;
}

export interface PreflightDeps {
  sendLog: SentRowReader;
  findLockedBlueprint(companyName: string): Promise<DriveFile>;
}

/** Checks 1-5 in spec order. */
export async function runPreflight(
  task: BlueprintTask,
  deps: PreflightDeps,
): Promise<{ task: CheckedTask; file: DriveFile }> {
  const checked = await checkTask(task, deps.sendLog);
  const file = checkFile(await deps.findLockedBlueprint(checked.companyName));
  return { task: checked, file };
}

/** Resend template variables (spec section 8, without UNLOCK_URL). Pure. */
export function buildTemplateVariables(task: CheckedTask, cfg: BlueprintConfig): TemplateVariables {
  return {
    CLIENT_NAME: task.clientName,
    COMPANY_NAME: task.companyName,
    BLUEPRINT_SCORE: task.blueprintScore,
    TRACK: task.track,
    CRITICAL_DIMENSIONS: task.criticalDimensions,
    SENDER_NAME: cfg.template.senderName,
    BOOKING_URL: cfg.template.bookingUrl,
  };
}

/** Characters unsafe in filenames on common systems, plus control characters. */
// eslint-disable-next-line no-control-regex
const UNSAFE_FILENAME_CHARS = /[\\/:*?"<>|\u0000-\u001f\u007f]/g;

/** `PulseLogica_Operational_Blueprint_{CompanyName}_Locked.pdf` with unsafe characters stripped. */
export function clientFacingFilename(companyName: string): string {
  const safe = companyName.replace(UNSAFE_FILENAME_CHARS, "").replace(/\s+/g, " ").trim();
  return `PulseLogica_Operational_Blueprint_${safe}_Locked.pdf`;
}

/** Resend tags allow ASCII letters, digits, `_` and `-`, up to 256 chars. Others become `_`. */
export function sanitizeTag(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256);
}
