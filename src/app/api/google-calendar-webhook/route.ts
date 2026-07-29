import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();

  console.log("Google Calendar webhook received:", {
    channelId: req.headers.get("x-goog-channel-id"),
    resourceId: req.headers.get("x-goog-resource-id"),
    resourceState: req.headers.get("x-goog-resource-state"),
    resourceUri: req.headers.get("x-goog-resource-uri"),
    messageNumber: req.headers.get("x-goog-message-number"),
    body,
  });

  return NextResponse.json({ ok: true });
}
