// Blueprint email automation: logging with email redaction (spec section 13).
// All blueprint modules log through here, never through console or @/lib/logger directly.

import { logError, logInfo, logWarn } from "@/lib/logger";

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

function redact(context: LogContext): LogContext {
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = typeof value === "string" ? redactEmails(value) : value;
  }
  return out;
}

export function bpInfo(event: string, context: LogContext = {}): void {
  logInfo(`blueprint.${event}`, redact(context));
}

export function bpWarn(event: string, context: LogContext = {}): void {
  logWarn(`blueprint.${event}`, redact(context));
}

/** Logs only the error's name, code and redacted message, never a stack with payloads. */
export function bpError(event: string, context: LogContext = {}, err?: unknown): void {
  const errorInfo =
    err === undefined
      ? {}
      : {
          errorName: err instanceof Error ? err.name : typeof err,
          errorMessage: redactEmails(err instanceof Error ? err.message : String(err)),
        };
  logError(`blueprint.${event}`, redact({ ...context, ...errorInfo }));
}
