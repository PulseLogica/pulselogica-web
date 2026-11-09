import { describe, expect, test } from "bun:test";
import { classifyHttpStatus, httpError, networkError, PipelineError } from "@/lib/blueprint/errors";

describe("classifyHttpStatus", () => {
  test.each([408, 429, 500, 502, 503, 599])("%d is transient", (status) => {
    expect(classifyHttpStatus(status)).toBe("transient");
  });
  test.each([401, 403])("%d is auth", (status) => {
    expect(classifyHttpStatus(status)).toBe("auth");
  });
  test.each([400, 404, 409, 422])("%d is permanent", (status) => {
    expect(classifyHttpStatus(status)).toBe("permanent");
  });
});

describe("error builders", () => {
  test("httpError carries kind, default code and step", () => {
    const err = httpError(503, "resend_send");
    expect(err).toBeInstanceOf(PipelineError);
    expect(err.kind).toBe("transient");
    expect(err.code).toBe("HTTP_503");
    expect(err.step).toBe("resend_send");
    expect(err.message).toBe("HTTP_503");
  });

  test("httpError keeps a custom code", () => {
    expect(httpError(401, "drive_download", "DRIVE_AUTH").code).toBe("DRIVE_AUTH");
  });

  test("timeouts and network failures are transient", () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    expect(networkError(timeout, "clickup_fetch")).toMatchObject({ kind: "transient", code: "NETWORK_TIMEOUT" });
    expect(networkError(new TypeError("fetch failed"), "slack_post")).toMatchObject({
      kind: "transient",
      code: "NETWORK_ERROR",
      step: "slack_post",
    });
  });
});
