import { loadBlueprintConfig, type BlueprintConfig } from "@/lib/blueprint/config";

/** Complete fake env. Values are dummies, never real secrets. */
export function fakeEnv(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    BLUEPRINT_SEND_MODE: "test",
    BLUEPRINT_TEST_RECIPIENT: "test-inbox@example.com",
    RESEND_API_KEY: "re_test",
    RESEND_TEMPLATE_ID: "blueprint-delivery-locked",
    RESEND_FROM: "Sender <sender@example.com>",
    RESEND_REPLY_TO: "reply@example.com",
    CLICKUP_API_TOKEN: "pk_test",
    CLICKUP_WEBHOOK_SECRET: "clickup-secret",
    CLICKUP_BLUEPRINT_LIST_ID: "list-1",
    GOOGLE_SERVICE_ACCOUNT_JSON: "{}",
    BLUEPRINTS_ROOT_FOLDER_ID: "root-folder",
    SLACK_BOT_TOKEN: "xoxb-test",
    SLACK_SIGNING_SECRET: "slack-secret",
    SLACK_APPROVALS_CHANNEL_ID: "C_APPROVALS",
    SLACK_ALERTS_CHANNEL_ID: "C_ALERTS",
    SLACK_APPROVER_IDS: "U_KEVIN, U_OTHER",
    SLACK_OWNER_DATA_ID: "U_BON",
    SLACK_OWNER_APPROVAL_ID: "U_KEVIN",
    CRON_SECRET: "cron-secret",
    SUPABASE_URL: "http://127.0.0.1:54321",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    BOOKING_URL: "https://example.com/book",
    SENDER_NAME: "Kevin",
    ...overrides,
  };
}

export function fakeConfig(overrides: Record<string, string | undefined> = {}): BlueprintConfig {
  return loadBlueprintConfig(fakeEnv(overrides));
}
