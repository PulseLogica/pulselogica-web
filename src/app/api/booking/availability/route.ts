import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const year = Number(req.nextUrl.searchParams.get("year"));
  const month = Number(req.nextUrl.searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json({ error: "year and month query params are required" }, { status: 400 });
  }

  try {
    const availability = await getMonthAvailability(year, month);
    return NextResponse.json(availability);
  } catch (err) {
    console.error("Failed to fetch booking availability:", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
