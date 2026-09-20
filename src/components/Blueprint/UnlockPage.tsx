"use client";

import { useEffect, useRef, useState } from "react";

type QrState = { qrImageUrl: string; expiresAt: string };
type ViewState = "loading" | "qr" | "paid" | "error";

export default function UnlockPage({ orderReference }: { orderReference: string }) {
  const [view, setView] = useState<ViewState>("loading");
  const [qr, setQr] = useState<QrState | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function requestQr() {
    setView("loading");
    try {
      const res = await fetch(`/api/blueprint/${orderReference}/payment-intent`, {
        method: "POST",
      });

      if (!res.ok) {
        setView("error");
        return;
      }

      const data = (await res.json()) as QrState;
      setQr(data);
      setView("qr");
    } catch (err) {
      console.error("Failed to request QR:", err);
      setView("error");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/blueprint/${orderReference}/status`);
        if (res.ok) {
          const data = (await res.json()) as { status: "pending" | "paid" };
          if (data.status === "paid") {
            setView("paid");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check initial status:", err);
      }

      requestQr();
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderReference]);

  useEffect(() => {
    if (view !== "qr") return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/blueprint/${orderReference}/status`);
        if (!res.ok) return;
        const data = (await res.json()) as { status: "pending" | "paid" };
        if (data.status === "paid") {
          setView("paid");
        }
      } catch (err) {
        console.error("Failed to poll status:", err);
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [view, orderReference]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      <div className="card-dark w-full max-w-[440px] rounded-[18px] px-9 pt-10 pb-8 text-center">
        <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-5">
          Unlock your Operational Blueprint
        </div>

        {view === "loading" && <p className="text-slate-400">Generating your QR code…</p>}

        {view === "error" && (
          <>
            <p className="text-slate-400 mb-6">Something went wrong generating the QR code.</p>
            <button
              type="button"
              onClick={requestQr}
              className="btn-primary inline-block text-black font-bold text-[15px] px-6 py-3 rounded-[10px]"
            >
              Try again
            </button>
          </>
        )}

        {view === "qr" && qr && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr.qrImageUrl}
              alt="QR Ph payment code"
              className="w-full rounded-xl mb-6"
            />
            <p className="text-sm text-slate-400 mb-6">
              Scan with GCash, Maya, or any QR Ph-enabled banking app.
            </p>
            <button
              type="button"
              onClick={requestQr}
              className="text-sm text-slate-400 hover:text-cream transition"
            >
              Regenerate QR
            </button>
          </>
        )}

        {view === "paid" && (
          <>
            <div className="font-serif italic text-[32px] leading-[1.1] text-amber mb-4">
              Payment received
            </div>
            <p className="text-slate-400">Check your inbox — your unlocked Blueprint is on its way.</p>
          </>
        )}
      </div>
    </div>
  );
}
