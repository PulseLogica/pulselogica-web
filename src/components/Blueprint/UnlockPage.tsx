"use client";

import { useEffect, useRef, useState } from "react";

type QrState = { qrImageUrl: string; expiresAt: string; unlockPriceCentavos: number };
type ViewState = "loading" | "qr" | "expired" | "paid" | "error";

function formatPrice(centavos: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(centavos / 100);
}

function formatCountdown(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2 annot mb-8">
      <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="w-1 h-1 rounded-[1px]"
            style={{ background: i === 2 ? "var(--color-amber)" : "rgba(148,163,184,0.3)" }}
          />
        ))}
      </div>
      PULSELOGICA
    </div>
  );
}

export default function UnlockPage({ orderReference }: { orderReference: string }) {
  const [view, setView] = useState<ViewState>("loading");
  const [qr, setQr] = useState<QrState | null>(null);
  const [msRemaining, setMsRemaining] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (view !== "qr" || !qr) return;

    const expiresAtMs = new Date(qr.expiresAt).getTime();

    function tick() {
      const remaining = expiresAtMs - Date.now();
      setMsRemaining(remaining);
      if (remaining <= 0) {
        setView("expired");
      }
    }

    tick();
    countdownRef.current = setInterval(tick, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [view, qr]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8">
      <Logo />

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

        {(view === "qr" || view === "expired") && qr && (
          <>
            <div className="font-serif italic text-[28px] leading-[1.1] text-amber mb-6">
              {formatPrice(qr.unlockPriceCentavos)}
            </div>

            <div
              className="relative inline-block p-4 rounded-2xl mb-4"
              style={{
                background: "rgba(255,122,0,.06)",
                border: "1px solid rgba(255,122,0,.35)",
                boxShadow: "0 0 40px 0 rgba(255,122,0,0.15)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr.qrImageUrl}
                alt="QR Ph payment code"
                className="w-full rounded-xl"
                style={{ opacity: view === "expired" ? 0.25 : 1, transition: "opacity 0.3s" }}
              />
              {view === "expired" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-black/70 px-3 py-1.5 rounded-full">
                    Expired
                  </span>
                </div>
              )}
            </div>

            {view === "qr" ? (
              <p className="text-xs text-slate-500 mb-6">Expires in {formatCountdown(msRemaining)}</p>
            ) : (
              <p className="text-xs text-slate-500 mb-6">This QR code has expired.</p>
            )}

            <p className="text-sm text-slate-400 mb-6">
              Scan with GCash, Maya, or any QR Ph-enabled banking app.
            </p>

            <button
              type="button"
              onClick={requestQr}
              className="btn-secondary inline-block text-white font-semibold text-sm px-6 py-3 rounded-[10px]"
            >
              Regenerate QR
            </button>
          </>
        )}

        {view === "paid" && (
          <>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-extrabold"
              style={{ background: "var(--color-amber)", color: "#0A0F1D" }}
            >
              ✓
            </div>
            <div className="font-serif italic text-[32px] leading-[1.1] text-amber mb-4">
              Payment received
            </div>
            <p className="text-slate-400">Check your inbox — your unlocked Blueprint is on its way.</p>
          </>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500/60 tracking-wide">
        Where your <span className="font-serif italic text-amber/70">pulse</span> becomes logic.
      </div>
    </div>
  );
}
