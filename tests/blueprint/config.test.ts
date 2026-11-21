import { afterEach, describe, expect, test } from "bun:test";
import {
  BlueprintConfigError,
  getBlueprintConfig,
  loadBlueprintConfig,
  setBlueprintConfigForTests,
} from "@/lib/blueprint/config";
import { fakeConfig, fakeEnv } from "./helpers";

afterEach(() => setBlueprintConfigForTests(null));

describe("loadBlueprintConfig", () => {
  test("parses a complete env", () => {
    const cfg = loadBlueprintConfig(fakeEnv());
    expect(cfg.sendMode).toBe("test");
    expect(cfg.testRecipient).toBe("test-inbox@example.com");
    expect(cfg.slack.approverIds).toEqual(["U_KEVIN", "U_OTHER"]);
  });

  test("throws listing every missing required var", () => {
    const run = () => loadBlueprintConfig(fakeEnv({ RESEND_API_KEY: undefined, CRON_SECRET: "  " }));
    expect(run).toThrow(BlueprintConfigError);
    try {
      run();
    } catch (err) {
      expect((err as BlueprintConfigError).missing).toEqual(["RESEND_API_KEY", "CRON_SECRET"]);
    }
  });

  test("error message names vars but never includes values", () => {
    try {
      loadBlueprintConfig(fakeEnv({ SLACK_BOT_TOKEN: undefined }));
      throw new Error("expected throw");
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).toContain("SLACK_BOT_TOKEN");
      expect(msg).not.toContain("re_test");
    }
  });

  test("defaults to test mode for unset or unknown mode", () => {
    expect(loadBlueprintConfig(fakeEnv({ BLUEPRINT_SEND_MODE: undefined })).sendMode).toBe("test");
    expect(loadBlueprintConfig(fakeEnv({ BLUEPRINT_SEND_MODE: "LIVE" })).sendMode).toBe("test");
  });

  test("test mode requires BLUEPRINT_TEST_RECIPIENT", () => {
    expect(() => loadBlueprintConfig(fakeEnv({ BLUEPRINT_TEST_RECIPIENT: undefined }))).toThrow(
      BlueprintConfigError,
    );
  });

  test("live mode does not require a test recipient", () => {
    const cfg = loadBlueprintConfig(fakeEnv({ BLUEPRINT_SEND_MODE: "live", BLUEPRINT_TEST_RECIPIENT: undefined }));
    expect(cfg.sendMode).toBe("live");
    expect(cfg.testRecipient).toBeNull();
  });
});

describe("getBlueprintConfig", () => {
  test("returns the injected config and caches it", () => {
    const cfg = fakeConfig();
    setBlueprintConfigForTests(cfg);
    expect(getBlueprintConfig()).toBe(cfg);
    expect(getBlueprintConfig()).toBe(cfg);
  });
});
