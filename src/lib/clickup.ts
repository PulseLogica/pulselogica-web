import type { PulseCheckPayload } from "@/lib/pulse-check-types";

function buildTaskName({ contact, track }: PulseCheckPayload) {
  return `${contact.firstName} ${contact.lastName} — ${contact.businessName} (${track})`;
}

function buildTaskDescription({ contact, answers, depAvg, urgAvg, overall, track, hotLead }: PulseCheckPayload) {
  const contactBlock = [
    `**Email:** ${contact.email}`,
    `**Business Name:** ${contact.businessName}`,
    `**Website:** ${contact.website || "—"}`,
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

export async function createClickUpTask(payload: PulseCheckPayload) {
  const apiToken = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;

  if (!apiToken || !listId) {
    throw new Error("CLICKUP_API_TOKEN or CLICKUP_LIST_ID is not configured");
  }

  const res = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiToken,
    },
    body: JSON.stringify({
      name: buildTaskName(payload),
      markdown_description: buildTaskDescription(payload),
    }),
  });

  if (!res.ok) {
    throw new Error(`ClickUp task creation failed with ${res.status}: ${await res.text()}`);
  }

  return res.json();
}
