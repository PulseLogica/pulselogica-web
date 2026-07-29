import type { PulseCheckPayload } from "@/lib/pulse-check-types";

const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";
const CLICKUP_API_V3_BASE = "https://api.clickup.com/api/v3";

const CUSTOM_FIELD_IDS = {
  companyName: "e0f2cbd6-99d2-4c7d-86f9-4da4f3677a69",
  website: "7f7d8448-5394-462b-b220-5763cdcf6374",
};

const PIPELINE_WORKSPACE_ID = "90161693471";
const PROSPECTS_DOC_ID = "2kz0wgrz-996";
const PROSPECTS_PAGE_ID = "2kz0wgrz-476";

const SOURCE_VALUE = "website diagnostic";

function buildTaskName({ contact, track }: PulseCheckPayload) {
  return `${contact.firstName} ${contact.lastName} — ${contact.businessName} (${track})`;
}

function buildTaskDescription({ contact, answers, depAvg, urgAvg, overall, track, hotLead }: PulseCheckPayload) {
  const contactBlock = [
    `**Email:** ${contact.email}`,
    `**Mobile Number:** ${contact.mobileNumber || "—"}`,
  ].join("\n");

  const answersBlock = answers
    .map(
      (a, i) =>
        `**Q${i + 1} — ${a.eyebrow}**\n${a.question}\n> ${a.answer ?? "No answer"}`
    )
    .join("\n\n");

  const scoresBlock = [
    `**Dependency Avg:** ${depAvg.toFixed(2)}`,
    `**Urgency Avg:** ${urgAvg.toFixed(2)}`,
    `**Overall:** ${overall.toFixed(2)}`,
    `**Track:** ${track}`,
    hotLead ? `**🔥 Hot Lead**` : `**Hot Lead:** No`,
  ].join("\n");

  return [contactBlock, "---", answersBlock, "---", scoresBlock].join("\n\n");
}

async function findSourceFieldId(listId: string, apiToken: string): Promise<string | undefined> {
  const res = await fetch(`${CLICKUP_API_BASE}/list/${listId}/field`, {
    headers: { Authorization: apiToken },
  });

  if (!res.ok) {
    console.error(`Failed to fetch ClickUp custom fields: ${res.status}`);
    return undefined;
  }

  const data = await res.json();
  const sourceField = (data.fields ?? []).find(
    (f: { name: string }) => f.name.toLowerCase() === "source"
  );

  if (!sourceField) {
    console.error('ClickUp custom field "Source" not found on the Leads list');
  }

  return sourceField?.id;
}

export async function createClickUpTask(payload: PulseCheckPayload) {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;

  if (!apiToken || !listId) {
    throw new Error("CLICKUP_API_TOKEN or CLICKUP_LIST_ID is not configured");
  }

  const sourceFieldId = await findSourceFieldId(listId, apiToken);

  const customFields = [
    { id: CUSTOM_FIELD_IDS.companyName, value: payload.contact.businessName },
    { id: CUSTOM_FIELD_IDS.website, value: payload.contact.website || "" },
    ...(sourceFieldId ? [{ id: sourceFieldId, value: SOURCE_VALUE }] : []),
  ];

  const res = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
    },
    body: JSON.stringify({
      name: buildTaskName(payload),
      markdown_description: buildTaskDescription(payload),
      custom_fields: customFields,
    }),
  });

  if (!res.ok) {
    throw new Error(`ClickUp task creation failed with ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function createClickUpProspectSubpage(payload: PulseCheckPayload) {
  const apiToken = process.env.CLICKUP_API_TOKEN;

  if (!apiToken) {
    throw new Error("CLICKUP_API_TOKEN is not configured");
  }

  const res = await fetch(
    `${CLICKUP_API_V3_BASE}/workspaces/${PIPELINE_WORKSPACE_ID}/docs/${PROSPECTS_DOC_ID}/pages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiToken,
      },
      body: JSON.stringify({
        parent_page_id: PROSPECTS_PAGE_ID,
        name: `${payload.contact.firstName} ${payload.contact.lastName}`,
        content: buildTaskDescription(payload),
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`ClickUp subpage creation failed with ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export async function updateClickUpTask({ taskId, status }: { taskId: string; status: string }) {
  const apiToken = process.env.CLICKUP_API_TOKEN;

  if (!apiToken) {
    throw new Error("CLICKUP_API_TOKEN is not configured");
  }

  const res = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(`ClickUp task update failed with ${res.status}: ${await res.text()}`);
  }

  return res.json();
}
