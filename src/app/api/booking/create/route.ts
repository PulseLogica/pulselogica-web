import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/google-calendar";
import { updateClickUpTask } from "@/lib/clickup";
import type { ContactFormValues } from "@/components/PulseCheck/schema";

export async function POST(req: NextRequest) {
  const { date, time, contact, clickupTaskId } = (await req.json()) as {
    date: string;
    time: string;
    contact: ContactFormValues;
    clickupTaskId?: string | null;
  };

  if (!date || !time || !contact) {
    return NextResponse.json({ error: "date, time, and contact are required" }, { status: 400 });
  }

  let event;
  try {
    event = await createBooking({ date, time, contact });
  } catch (err) {
    console.error("Failed to create booking:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 409 });
  }

  if (clickupTaskId) {
    try {
      await updateClickUpTask({ taskId: clickupTaskId, status: "Discovery Call Scheduled" });
    } catch (err) {
      console.error("Failed to update ClickUp task status:", err);
    }
  }

  return NextResponse.json({ ok: true, event });
}
