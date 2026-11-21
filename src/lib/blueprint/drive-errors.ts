// Blueprint email automation: classify googleapis / google-auth-library errors (spec 10.1).
// Pure: no googleapis import, works on the error's shape so tests can use plain objects.

import { PipelineError, httpError, networkError, type FailedStep } from "./errors";

const RATE_LIMIT_REASONS = new Set(["rateLimitExceeded", "userRateLimitExceeded"]);
const OAUTH_AUTH_ERRORS = new Set(["invalid_grant", "unauthorized_client"]);

interface GoogleErrorShape {
  status?: unknown;
  code?: unknown;
  message?: unknown;
  errors?: unknown;
  response?: { status?: unknown; data?: unknown };
}

const asShape = (err: unknown): GoogleErrorShape => (typeof err === "object" && err !== null ? err : {});

function statusOf(e: GoogleErrorShape): number | undefined {
  for (const candidate of [e.status, e.response?.status, e.code]) {
    if (typeof candidate === "number" && candidate >= 400 && candidate <= 599) return candidate;
  }
  return undefined;
}

function reasonsFrom(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    const reason = (item as { reason?: unknown } | null)?.reason;
    return typeof reason === "string" ? [reason] : [];
  });
}

/** Drive API error reasons, from `errors[]` or `response.data.error.errors[]`. */
function reasonsOf(e: GoogleErrorShape): string[] {
  const data = e.response?.data as { error?: { errors?: unknown } } | undefined;
  const nested = typeof data?.error === "object" && data.error !== null ? data.error.errors : undefined;
  return [...reasonsFrom(e.errors), ...reasonsFrom(nested)];
}

/** OAuth token endpoint error (`{ error: "invalid_grant" }`), from the body or the message. */
function oauthErrorOf(e: GoogleErrorShape): string | undefined {
  const bodyError = (e.response?.data as { error?: unknown } | undefined)?.error;
  if (typeof bodyError === "string" && OAUTH_AUTH_ERRORS.has(bodyError)) return bodyError;
  const message = typeof e.message === "string" ? e.message : "";
  return [...OAUTH_AUTH_ERRORS].find((code) => message.includes(code));
}

/**
 * Maps a Drive error to a PipelineError:
 * - OAuth invalid_grant / unauthorized_client (any status): auth
 * - 403 with reason rateLimitExceeded / userRateLimitExceeded: transient
 * - otherwise by HTTP status: 401/403 auth, 408/429/5xx transient, other 4xx permanent
 * - no status: network failure, transient
 * Raw messages are dropped because they can carry request URLs and query text.
 */
export function classifyDriveError(err: unknown, step: FailedStep): PipelineError {
  if (err instanceof PipelineError) return err;
  const e = asShape(err);
  const oauth = oauthErrorOf(e);
  if (oauth) return new PipelineError("auth", `OAUTH_${oauth.toUpperCase()}`, step, `Drive auth failed (${oauth})`);
  const status = statusOf(e);
  if (status === 403 && reasonsOf(e).some((r) => RATE_LIMIT_REASONS.has(r))) {
    return new PipelineError("transient", "DRIVE_RATE_LIMITED", step, "Drive rate limit exceeded (HTTP 403)");
  }
  if (status !== undefined) return httpError(status, step, undefined, `Drive request failed with HTTP ${status}`);
  const net = networkError(err, step);
  return new PipelineError(net.kind, net.code, step, `Drive request failed (${net.code})`);
}
