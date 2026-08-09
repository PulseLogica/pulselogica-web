"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactFormValues } from "./utils/schema";
import { WEEKDAY_LABELS, MONTH_LABELS } from "@/lib/constants";
import { formatTime, toDateStr } from "@/lib/helpers";

export default function BookingCalendar({
  contact,
  clickupTaskId,
  onBooked,
}: {
  contact: ContactFormValues;
  clickupTaskId: string | null;
  onBooked: () => void;
}) {
  const router = useRouter();
  const now = new Date();
  const [monthCursor, setMonthCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingTime, setPendingTime] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<"idle" | "booking" | "confirmed">("idle");
  const [confirmedSlot, setConfirmedSlot] = useState<{ date: string; time: string } | null>(null);
  const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCurrentMonth = monthCursor.year === now.getFullYear() && monthCursor.month === now.getMonth() + 1;

  useEffect(() => {
    setLoading(true);
    setSelectedDate(null);
    fetch(`/api/booking/availability?year=${monthCursor.year}&month=${monthCursor.month}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data))
      .catch((err) => console.error("Failed to load availability:", err))
      .finally(() => setLoading(false));
  }, [monthCursor]);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, []);

  async function confirmBooking() {
    if (!selectedDate || !pendingTime) return;
    const time = pendingTime;
    setBookingState("booking");

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, time, contact, clickupTaskId }),
      });

      if (!res.ok) throw new Error("Booking failed");

      setConfirmedSlot({ date: selectedDate, time });
      setBookingState("confirmed");
      setPendingTime(null);
      onBooked();
      redirectTimeout.current = setTimeout(() => router.push("/"), 5000);
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingState("idle");
      setPendingTime(null);
    }
  }

  function formatDateLabel(dateStr: string) {
    const dateObj = new Date(`${dateStr}T00:00:00`);
    return `${MONTH_LABELS[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  }

  if (bookingState === "confirmed" && confirmedSlot) {
    return (
      <div className="text-center">
        <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-2.5">Booking Confirmed</div>
        <div className="font-serif italic text-[36px] leading-[1.1] text-amber mb-5">You&apos;re booked!</div>
        <p className="text-base leading-[1.65] text-slate-400 max-w-[440px] mx-auto mb-2">
          {formatDateLabel(confirmedSlot.date)} at {formatTime(confirmedSlot.time)}
        </p>
        <p className="text-sm text-slate-500">Redirecting you home shortly…</p>
      </div>
    );
  }

  const firstOfMonth = new Date(Date.UTC(monthCursor.year, monthCursor.month - 1, 1));
  const daysInMonth = new Date(Date.UTC(monthCursor.year, monthCursor.month, 0)).getUTCDate();
  const startWeekday = firstOfMonth.getUTCDay();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="text-center">
      <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-2.5">Book your Discovery Call</div>

      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          disabled={isCurrentMonth}
          onClick={() => setMonthCursor((c) => (c.month === 1 ? { year: c.year - 1, month: 12 } : { year: c.year, month: c.month - 1 }))}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-cream"
        >
          ← Prev
        </button>
        <div className="font-serif italic text-xl text-cream">
          {MONTH_LABELS[monthCursor.month - 1]} {monthCursor.year}
        </div>
        <button
          type="button"
          onClick={() => setMonthCursor((c) => (c.month === 12 ? { year: c.year + 1, month: 1 } : { year: c.year, month: c.month + 1 }))}
          className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-cream"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="text-xs text-slate-500 py-1">
            {label}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const dateStr = toDateStr(monthCursor.year, monthCursor.month, day);
          const hasSlots = !loading && (availability[dateStr]?.length ?? 0) > 0;
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={i}
              type="button"
              disabled={!hasSlots}
              onClick={() => setSelectedDate(dateStr)}
              className="aspect-square rounded-lg text-sm transition"
              style={
                isSelected
                  ? { background: "rgba(255,122,0,.25)", color: "var(--color-white)", border: "1px solid var(--color-amber)" }
                  : hasSlots
                  ? { background: "rgba(255,255,255,0.02)", color: "var(--color-white)", border: "1px solid rgba(148,163,184,0.16)" }
                  : { color: "rgba(148,163,184,0.3)", border: "1px solid transparent" }
              }
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="flex flex-col gap-2.5">
          {(availability[selectedDate] ?? []).map((time) => (
            <button
              key={time}
              type="button"
              disabled={bookingState === "booking"}
              onClick={() => setPendingTime(time)}
              className="btn-primary text-black font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
      )}

      {pendingTime && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-5">
          <div className="card-dark w-full max-w-sm rounded-[18px] px-7 py-8 text-center">
            <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-2.5">
              Confirm your booking
            </div>
            <p className="text-base leading-[1.65] text-slate-300 mb-7">
              {formatDateLabel(selectedDate)} at {formatTime(pendingTime)}
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={confirmBooking}
                disabled={bookingState === "booking"}
                className="btn-primary text-black font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {bookingState === "booking" ? "Booking…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setPendingTime(null)}
                disabled={bookingState === "booking"}
                className="text-sm text-slate-400 hover:text-cream disabled:opacity-60"
              >
                Choose a different time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
