import { google } from "googleapis";
import type { ContactFormValues } from "@/components/PulseCheck/schema";

export const SLOT_TIMES = ["11:00", "13:00", "13:45", "14:30", "15:15", "16:00", "20:00", "20:45"];
export const SLOT_DURATION_MINUTES = 45;
export const TIMEZONE = "Asia/Manila";

function getCalendarClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth credentials are not configured");
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  return google.calendar({ version: "v3", auth });
}

function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID is not configured");
  }
  return calendarId;
}

function slotToDate(dateStr: string, time: string) {
  return new Date(`${dateStr}T${time}:00+08:00`);
}

function isWeekday(date: Date) {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

function toDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getMonthAvailability(year: number, month: number) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));
  const now = new Date();

  const freebusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: monthStart.toISOString(),
      timeMax: monthEnd.toISOString(),
      timeZone: TIMEZONE,
      items: [{ id: calendarId }],
    },
  });

  const busyPeriods = (freebusyRes.data.calendars?.[calendarId]?.busy ?? []).map((b) => ({
    start: new Date(b.start!),
    end: new Date(b.end!),
  }));

  const availability: Record<string, string[]> = {};

  for (
    let cursor = new Date(monthStart);
    cursor < monthEnd;
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000)
  ) {
    if (!isWeekday(cursor)) continue;

    const dateStr = toDateStr(cursor);
    const availableTimes = SLOT_TIMES.filter((time) => {
      const slotStart = slotToDate(dateStr, time);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      if (slotStart < now) return false;

      return !busyPeriods.some((busy) => slotStart < busy.end && slotEnd > busy.start);
    });

    if (availableTimes.length > 0) {
      availability[dateStr] = availableTimes;
    }
  }

  return availability;
}

export async function createBooking({
  date,
  time,
  contact,
}: {
  date: string;
  time: string;
  contact: ContactFormValues;
}) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const startDate = slotToDate(date, time);
  const endDate = new Date(startDate.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

  const res = await calendar.events.insert({
    calendarId,
    sendUpdates: "all",
    requestBody: {
      summary: `Strategy Call — ${contact.firstName} ${contact.lastName} (${contact.businessName})`,
      description: [
        `**Email:** ${contact.email}`,
        `**Mobile Number:** ${contact.mobileNumber || "—"}`,
        `**Website:** ${contact.website || "—"}`,
      ].join("\n"),
      start: { dateTime: startDate.toISOString(), timeZone: TIMEZONE },
      end: { dateTime: endDate.toISOString(), timeZone: TIMEZONE },
      attendees: [{ email: contact.email, displayName: `${contact.firstName} ${contact.lastName}` }],
    },
  });

  return res.data;
}
