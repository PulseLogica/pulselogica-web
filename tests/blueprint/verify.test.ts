import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import crypto from "crypto";
import { setBlueprintConfigForTests } from "@/lib/blueprint/config";
import { verifyClickUp, verifyCron, verifySlack } from "@/lib/blueprint/verify";
import { fakeConfig } from "./helpers";

const hmac = (secret: string, data: string) => crypto.createHmac("sha256", secret).update(data).digest("hex");

beforeAll(() => setBlueprintConfigForTests(fakeConfig()));
afterAll(() => setBlueprintConfigForTests(null));

describe("verifyClickUp", () => {
  const body = JSON.stringify({ event: "taskStatusUpdated", task_id: "abc" });

  test("accepts a valid signature", () => {
    expect(verifyClickUp(body, hmac("clickup-secret", body))).toBe(true);
  });
  test("rejects a signature made with another secret", () => {
    expect(verifyClickUp(body, hmac("wrong", body))).toBe(false);
  });
  test("rejects a tampered body", () => {
    expect(verifyClickUp(`${body} `, hmac("clickup-secret", body))).toBe(false);
  });
  test("rejects missing, empty and wrong-length headers", () => {
    expect(verifyClickUp(body, null)).toBe(false);
    expect(verifyClickUp(body, "")).toBe(false);
    expect(verifyClickUp(body, "abc123")).toBe(false);
  });
});

describe("verifySlack", () => {
  const body = "payload=%7B%22type%22%3A%22block_actions%22%7D";
  const now = 1_800_000_000;
  const sign = (ts: number, secret = "slack-secret") => `v0=${hmac(secret, `v0:${ts}:${body}`)}`;

  test("accepts a valid, fresh signature", () => {
    expect(verifySlack(body, String(now), sign(now), now)).toBe(true);
  });
  test("accepts a timestamp just inside 5 minutes", () => {
    expect(verifySlack(body, String(now - 300), sign(now - 300), now)).toBe(true);
  });
  test("rejects an invalid signature", () => {
    expect(verifySlack(body, String(now), sign(now, "wrong"), now)).toBe(false);
  });
  test("rejects a stale timestamp even with a valid signature", () => {
    expect(verifySlack(body, String(now - 301), sign(now - 301), now)).toBe(false);
  });
  test("rejects a timestamp far in the future", () => {
    expect(verifySlack(body, String(now + 301), sign(now + 301), now)).toBe(false);
  });
  test("rejects missing or non-numeric headers", () => {
    expect(verifySlack(body, null, sign(now), now)).toBe(false);
    expect(verifySlack(body, String(now), null, now)).toBe(false);
    expect(verifySlack(body, "12a", sign(now), now)).toBe(false);
  });
  test("defaults to the current clock", () => {
    const ts = Math.floor(Date.now() / 1000);
    expect(verifySlack(body, String(ts), sign(ts))).toBe(true);
  });
});

describe("verifyCron", () => {
  test("accepts the bearer secret", () => {
    expect(verifyCron("Bearer cron-secret")).toBe(true);
  });
  test("rejects a wrong, unprefixed or missing token", () => {
    expect(verifyCron("Bearer cron-secreT")).toBe(false);
    expect(verifyCron("cron-secret")).toBe(false);
    expect(verifyCron("Bearer ")).toBe(false);
    expect(verifyCron(null)).toBe(false);
  });
});
