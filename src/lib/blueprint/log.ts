// Blueprint email automation: logging with email redaction (spec section 13).
// All blueprint modules log through here, never through console or @/lib/logger directly.

import { logError, logInfo, logWarn } from "@/lib/logger";
import { PipelineError } from "./errors";

type LogContext = Record<string, unknown>;

const EMAIL_PATTERN = /[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]+/g;

/** `kevin@pulselogica.com` -> `k***@pulselogica.com`. Anything unparseable -> `***`. */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "***";
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return "***";
  return `${trimmed[0]}***${trimmed.slice(at)}`;
}

/** Masks every email address found inside a string. */
export function redactEmails(text: string): string {
  return text.replace(EMAIL_PATTERN, (match) => maskEmail(match));
}

const MAX_DEPTH = 6;

/** Masks emails in strings at any depth of plain objects and arrays. Cycles become "[Circular]". */
function redactValue(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (typeof value === "string") return redactEmails(value);
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[Circular]";
  if (depth >= MAX_DEPTH) return "[Truncated]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((v) => redactValue(v, seen, depth + 1));
  if (value instanceof Date) return value.toISOString();
  const out: LogContext = {};
  for (const [key, v] of Object.entries(value)) out[key] = redactValue(v, seen, depth + 1);
  return out;
}

function redact(context: LogContext): LogContext {
  return redactValue(context, new WeakSet(), 0) as LogContext;
}

export function bpInfo(event: string, context: LogContext = {}): void {
  logInfo(`blueprint.${event}`, redact(context));
}

export function bpWarn(event: string, context: LogContext = {}): void {
  logWarn(`blueprint.${event}`, redact(context));
}

/** Logs only the error's name, code, kind, step and redacted message, never a stack with payloads. */
export function bpError(event: string, context: LogContext = {}, err?: unknown): void {
  const errorInfo =
    err === undefined
      ? {}
      : {
          errorName: err instanceof Error ? err.name : typeof err,
          errorMessage: redactEmails(err instanceof Error ? err.message : String(err)),
          ...(err instanceof PipelineError ? { errorCode: err.code, errorKind: err.kind, errorStep: err.step } : {}),
        };
  logError(`blueprint.${event}`, redact({ ...context, ...errorInfo }));
}
