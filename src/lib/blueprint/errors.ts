// Blueprint email automation: pipeline errors and classification (spec 10.1).

export type ErrorKind = "transient" | "permanent" | "auth";
export type FailedStep =
  | "clickup_fetch"
  | "drive_lookup"
  | "slack_post"
  | "drive_download"
  | "resend_send";

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
