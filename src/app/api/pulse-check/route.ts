import { NextRequest, NextResponse } from "next/server";
import { createClickUpTask, createClickUpProspectSubpage } from "@/lib/clickup";
import type { PulseCheckPayload } from "@/types/pulse-check-types";

async function syncToGoogleSheets(payload: PulseCheckPayload) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("GOOGLE_SHEETS_WEBHOOK_URL is not configured");
  }

  const upstream = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!upstream.ok) {
    throw new Error(`Upstream responded with ${upstream.status}`);
  }
}

export async function POST(req: NextRequest) {
  const payload: PulseCheckPayload = await req.json();

  const [sheetsResult, clickupResult, prospectSubpageResult] = await Promise.allSettled([
    syncToGoogleSheets(payload),
    createClickUpTask(payload),
    createClickUpProspectSubpage(payload),
  ]);

  if (sheetsResult.status === "rejected") {
    console.error("Pulse Check Google Sheets sync failed:", sheetsResult.reason);
  }
  if (clickupResult.status === "rejected") {
    console.error("Pulse Check ClickUp task creation failed:", clickupResult.reason);
  }
  if (prospectSubpageResult.status === "rejected") {
    console.error("Pulse Check ClickUp prospect subpage creation failed:", prospectSubpageResult.reason);
  }

  return NextResponse.json({
    ok: true,
    clickupTaskId: clickupResult.status === "fulfilled" ? clickupResult.value.id : null,
  });
}
