import { describe, expect, test } from "bun:test";
import { decideFailure } from "@/lib/blueprint/send-log";

const now = new Date("2026-11-09T00:00:00.000Z");
const plus = (ms: number) => new Date(now.getTime() + ms).toISOString();

describe("decideFailure (section 11)", () => {
  test("transient on attempt 1 retries after 30 seconds", () => {
    expect(decideFailure("transient", 0, now)).toEqual({
      decision: "retry",
      status: "retry_scheduled",
      attempt_count: 1,
      next_retry_at: plus(30_000),
    });
  });

  test("transient on attempt 2 retries after 2 minutes", () => {
    expect(decideFailure("transient", 1, now)).toEqual({
      decision: "retry",
      status: "retry_scheduled",
      attempt_count: 2,
      next_retry_at: plus(120_000),
    });
  });

  test("transient on attempt 3 is exhausted and terminal", () => {
    expect(decideFailure("transient", 2, now)).toEqual({
      decision: "terminal",
      status: "failed_exhausted",
      attempt_count: 3,
      next_retry_at: null,
    });
  });

  test("permanent is terminal on attempt 1", () => {
    expect(decideFailure("permanent", 0, now)).toMatchObject({
      decision: "terminal",
      status: "failed_permanent",
      attempt_count: 1,
    });
  });

  test("auth is terminal on attempt 1", () => {
    expect(decideFailure("auth", 0, now)).toMatchObject({
      decision: "terminal",
      status: "failed_permanent",
      attempt_count: 1,
    });
  });

  test("attempt_count never exceeds the 0..3 check constraint", () => {
    expect(decideFailure("transient", 3, now).attempt_count).toBe(3);
    expect(decideFailure("transient", 3, now).decision).toBe("terminal");
  });
});
