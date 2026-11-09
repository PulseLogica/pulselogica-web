// Blueprint email automation: environment parsing and constants (spec section 6).
// Server only. Parsed lazily on first use and cached, so `next build` works without env.

export type SendMode = "test" | "live";

/** Test mode rule: when mode is not "live", every email goes to the test recipient. */
export const LIVE_SEND_MODE: SendMode = "live";
export const TEST_SUBJECT_PREFIX = "[TEST] ";

export const CLICKUP_STATUS = {
  readyToSend: "Ready to Send",
  sent: "Blueprint Sent",
  failed: "Send Failed",
} as const;

/** ClickUp custom field names (spec section 8). */
export const CLICKUP_FIELDS = {
  clientName: "Client Name",
  clientEmail: "Client Email",
  companyName: "Company Name",
  blueprintScore: "Blueprint Score",
  track: "Track",
  criticalDimensions: "Critical Dimensions",
} as const;

/** Retry rules (spec section 11). */
export const MAX_ATTEMPTS = 3;
/** Delay after attempt N fails, indexed by N - 1. Attempt 3 is terminal. */
export const RETRY_DELAYS_MS = [30_000, 120_000] as const;
export const APPROVAL_TTL_MS = 24 * 60 * 60 * 1000;

export interface BlueprintConfig {
  sendMode: SendMode;
  /** Required only in test mode. */
  testRecipient: string | null;
  resend: { apiKey: string; templateId: string; from: string; replyTo: string };
  clickup: { apiToken: string; webhookSecret: string; blueprintListId: string };
  google: { serviceAccountJson: string; blueprintsRootFolderId: string };
  slack: {
    botToken: string;
    signingSecret: string;
    approvalsChannelId: string;
    alertsChannelId: string;
    approverIds: string[];
    ownerDataId: string;
    ownerApprovalId: string;
  };
  cronSecret: string;
  supabase: { url: string; serviceRoleKey: string };
  template: { bookingUrl: string; senderName: string };
}

type Env = Record<string, string | undefined>;

export class BlueprintConfigError extends Error {
  constructor(public missing: string[]) {
    super(`Blueprint config missing required env vars: ${missing.join(", ")}`);
    this.name = "BlueprintConfigError";
  }
}

/** Parses env into a config. Throws BlueprintConfigError listing every missing var. */
export function loadBlueprintConfig(env: Env = process.env): BlueprintConfig {
  const missing: string[] = [];
  const req = (name: string): string => {
    const value = env[name]?.trim();
    if (!value) {
      missing.push(name);
      return "";
    }
    return value;
  };

  const sendMode: SendMode = env.BLUEPRINT_SEND_MODE?.trim() === LIVE_SEND_MODE ? "live" : "test";
  const testRecipient = sendMode === "test" ? req("BLUEPRINT_TEST_RECIPIENT") : null;
  const approverIds = req("SLACK_APPROVER_IDS")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const cfg: BlueprintConfig = {
    sendMode,
    testRecipient,
    resend: {
      apiKey: req("RESEND_API_KEY"),
      templateId: req("RESEND_TEMPLATE_ID"),
      from: req("RESEND_FROM"),
      replyTo: req("RESEND_REPLY_TO"),
    },
    clickup: {
      apiToken: req("CLICKUP_API_TOKEN"),
      webhookSecret: req("CLICKUP_WEBHOOK_SECRET"),
      blueprintListId: req("CLICKUP_BLUEPRINT_LIST_ID"),
    },
    google: {
      serviceAccountJson: req("GOOGLE_SERVICE_ACCOUNT_JSON"),
      blueprintsRootFolderId: req("BLUEPRINTS_ROOT_FOLDER_ID"),
    },
    slack: {
      botToken: req("SLACK_BOT_TOKEN"),
      signingSecret: req("SLACK_SIGNING_SECRET"),
      approvalsChannelId: req("SLACK_APPROVALS_CHANNEL_ID"),
      alertsChannelId: req("SLACK_ALERTS_CHANNEL_ID"),
      approverIds,
      ownerDataId: req("SLACK_OWNER_DATA_ID"),
      ownerApprovalId: req("SLACK_OWNER_APPROVAL_ID"),
    },
    cronSecret: req("CRON_SECRET"),
    supabase: {
      url: req("SUPABASE_URL"),
      serviceRoleKey: req("SUPABASE_SERVICE_ROLE_KEY"),
    },
    template: {
      bookingUrl: req("BOOKING_URL"),
      senderName: req("SENDER_NAME"),
    },
  };

  if (missing.length > 0) throw new BlueprintConfigError(missing);
  return cfg;
}

let cached: BlueprintConfig | null = null;

/** Returns the parsed config, parsing process.env on first call. */
export function getBlueprintConfig(): BlueprintConfig {
  if (!cached) cached = loadBlueprintConfig();
  return cached;
}

/** Test hook: inject a config, or pass null to force a re-parse on next call. */
export function setBlueprintConfigForTests(cfg: BlueprintConfig | null): void {
  cached = cfg;
}
