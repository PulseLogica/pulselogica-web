// Blueprint email automation: pipeline errors and classification (spec 10.1).

import { BlueprintConfigError } from "./config";

export type ErrorKind = "transient" | "permanent" | "auth";
export type FailedStep =
  | "clickup_fetch"
  /** ClickUp writes: comment and status update. */
  | "clickup_update"
  | "drive_lookup"
  | "slack_post"
  | "drive_download"
  | "resend_send"
  /** Preflight checks 1-3 and 5 (spec section 9). Check 4 fails under drive_lookup. */
  | "preflight";

export class PipelineError extends Error {
  constructor(
    public kind: ErrorKind,
    public code: string,
    public step: FailedStep,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "PipelineError";
  }
}

export function isPipelineError(err: unknown): err is PipelineError {
  return err instanceof PipelineError;
}

/** A failed send_log query. Carries the Postgres/PostgREST code, never row data. */
export class DbError extends Error {
  constructor(public op: string, public dbCode: string, message: string) {
    super(message);
    this.name = "DbError";
  }
}

/**
 * Wraps anything thrown inside a step as a PipelineError, so failure handling sees one type.
 * PipelineError passes through. Config errors are permanent (retrying will not fix env).
 * DB errors and anything else unknown default to transient.
 */
export function toPipelineError(err: unknown, step: FailedStep): PipelineError {
  if (err instanceof PipelineError) return err;
  if (err instanceof BlueprintConfigError) {
    return new PipelineError("permanent", "CONFIG_ERROR", step, err.message);
  }
  if (err instanceof DbError) {
    return new PipelineError("transient", "DB_ERROR", step, err.message);
  }
  const name = err instanceof Error ? err.name : "";
  if (name === "TimeoutError" || name === "AbortError") return networkError(err, step);
  return new PipelineError("transient", "UNEXPECTED_ERROR", step, err instanceof Error ? err.message : String(err));
}

/**
 * Maps an HTTP status to an ErrorKind. Same table for generic HTTP and Resend:
 * 408, 429, 5xx transient; 401, 403 auth; any other 4xx (incl. 400, 422) permanent.
 * Statuses outside 4xx/5xx are not errors and are treated as permanent if passed.
 */
export function classifyHttpStatus(status: number): ErrorKind {
  if (status === 408 || status === 429 || (status >= 500 && status <= 599)) return "transient";
  if (status === 401 || status === 403) return "auth";
  return "permanent";
}

/** Builds a PipelineError from a failed HTTP response. Code defaults to `HTTP_{status}`. */
export function httpError(
  status: number,
  step: FailedStep,
  code = `HTTP_${status}`,
  message?: string,
): PipelineError {
  return new PipelineError(classifyHttpStatus(status), code, step, message);
}

/** Network failures and timeouts (fetch rejection, AbortSignal.timeout) are transient. */
export function networkError(err: unknown, step: FailedStep): PipelineError {
  const name = err instanceof Error ? err.name : "";
  const code = name === "TimeoutError" || name === "AbortError" ? "NETWORK_TIMEOUT" : "NETWORK_ERROR";
  return new PipelineError("transient", code, step, err instanceof Error ? err.message : String(err));
}
