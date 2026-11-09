import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { PipelineError } from "@/lib/blueprint/errors";
import { bpError, bpInfo, bpWarn, maskEmail, redactEmails } from "@/lib/blueprint/log";

describe("maskEmail", () => {
  test("keeps the first character and the domain", () => {
    expect(maskEmail("kevin@pulselogica.com")).toBe("k***@pulselogica.com");
    expect(maskEmail("  bon@example.co.uk ")).toBe("b***@example.co.uk");
  });
  test("returns *** for empty or malformed input", () => {
    expect(maskEmail(null)).toBe("***");
    expect(maskEmail(undefined)).toBe("***");
    expect(maskEmail("")).toBe("***");
    expect(maskEmail("no-at-sign")).toBe("***");
    expect(maskEmail("@domain.com")).toBe("***");
    expect(maskEmail("user@")).toBe("***");
  });
});

describe("redactEmails", () => {
  test("masks every address inside text", () => {
    expect(redactEmails("to kevin@pulselogica.com and bon@example.com")).toBe(
      "to k***@pulselogica.com and b***@example.com",
    );
  });
});

describe("blueprint logger", () => {
  const spies: { mockRestore(): void }[] = [];
  afterEach(() => spies.splice(0).forEach((s) => s.mockRestore()));

  test("prefixes the event and masks emails in context", () => {
    const spy = spyOn(console, "log").mockImplementation(() => {});
    spies.push(spy);
    bpInfo("prepare.start", { recipient: "kevin@pulselogica.com", attempt: 1 });
    const entry = JSON.parse(String(spy.mock.calls[0][0]));
    expect(entry.event).toBe("blueprint.prepare.start");
    expect(entry.recipient).toBe("k***@pulselogica.com");
    expect(entry.attempt).toBe(1);
  });

  test("masks emails in nested objects and arrays, and survives cycles", () => {
    const spy = spyOn(console, "warn").mockImplementation(() => {});
    spies.push(spy);
    const cyclic: Record<string, unknown> = { note: "cc bon@example.com" };
    cyclic.self = cyclic;
    bpWarn("nested", { row: { client: { email: "kevin@pulselogica.com" } }, list: ["a@b.com", { x: "c@d.org" }], cyclic, n: 3 });
    const line = String(spy.mock.calls[0][0]);
    const entry = JSON.parse(line);
    expect(entry.row.client.email).toBe("k***@pulselogica.com");
    expect(entry.list).toEqual(["a***@b.com", { x: "c***@d.org" }]);
    expect(entry.cyclic).toEqual({ note: "cc b***@example.com", self: "[Circular]" });
    expect(entry.n).toBe(3);
    expect(line).not.toMatch(/kevin@|bon@|a@b|c@d/);
  });

  test("error logs include PipelineError code, kind and step", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});
    spies.push(spy);
    bpError("prepare.failed", {}, new PipelineError("auth", "HTTP_401", "drive_lookup", "denied"));
    const entry = JSON.parse(String(spy.mock.calls[0][0]));
    expect(entry).toMatchObject({ errorCode: "HTTP_401", errorKind: "auth", errorStep: "drive_lookup", errorMessage: "denied" });
  });

  test("error logs carry a redacted message and no stack", () => {
    const spy = spyOn(console, "error").mockImplementation(() => {});
    spies.push(spy);
    bpError("send.failed", {}, new Error("bounced for kevin@pulselogica.com"));
    const entry = JSON.parse(String(spy.mock.calls[0][0]));
    expect(entry.errorMessage).toBe("bounced for k***@pulselogica.com");
    expect(entry.stack).toBeUndefined();
    expect(JSON.stringify(entry)).not.toContain("kevin@");
  });
});
