import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("GOOGLE_SHEETS_WEBHOOK_URL is not configured");
    return NextResponse.json({ ok: false, error: "Sync not configured" }, { status: 502 });
  }

  const payload = await req.json();

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream responded with ${upstream.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Pulse Check Google Sheets sync failed:", err);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 502 });
  }
}
