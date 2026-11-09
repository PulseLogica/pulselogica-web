// Blueprint email automation: request verification (spec 10.2).
// Call these on the raw body (`await req.text()`) before parsing or touching the DB.

import crypto from "crypto";
import { getBlueprintConfig } from "./config";

export const SLACK_MAX_AGE_SECONDS = 5 * 60;

/** Constant-time string compare. Length is checked first (timingSafeEqual requires it). */
function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function hmacHex(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data, "utf8").digest("hex");
}

/**
 * ClickUp webhook: `X-Signature` header is the HMAC-SHA256 hex digest of the raw body,
 * keyed with the secret returned when the webhook was registered. VERIFY against ClickUp docs.
 */
export function verifyClickUp(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const expected = hmacHex(getBlueprintConfig().clickup.webhookSecret, rawBody);
  return safeEqual(expected, signatureHeader.trim().toLowerCase());
}

/**
 * Slack interactions: signature is `v0=` + HMAC-SHA256 hex of `v0:{ts}:{rawBody}`.
 * Rejects timestamps more than 5 minutes from now (replay protection).
 */
export function verifySlack(
  rawBody: string,
  tsHeader: string | null,
  sigHeader: string | null,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  if (!tsHeader || !sigHeader || !/^\d+$/.test(tsHeader)) return false;
  if (Math.abs(nowSeconds - Number(tsHeader)) > SLACK_MAX_AGE_SECONDS) return false;
  const secret = getBlueprintConfig().slack.signingSecret;
  const expected = `v0=${hmacHex(secret, `v0:${tsHeader}:${rawBody}`)}`;
  return safeEqual(expected, sigHeader);
}

/** Cron routes: `Authorization: Bearer {CRON_SECRET}`. */
export function verifyCron(authHeader: string | null): boolean {
  if (!authHeader) return false;
  return safeEqual(`Bearer ${getBlueprintConfig().cronSecret}`, authHeader);
}
