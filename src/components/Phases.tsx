"use client";

import { useState } from "react";
import { BOOK_STRATEGY_SESSION_URL } from "@/lib/constants";

type BadgeType = "warn" | "pending" | "ok";

type StageRow = { name: string; badge: string; type: BadgeType };

type Stage = {
  key: string;
  icon: string;
  label: string;
  eyebrow: string;
  title: React.ReactNode;
  desc: string;
  checklist: string[];
  mock: {
    label: string;
    title: string;
    sub: string;
    bar?: number;
    rows: StageRow[];
  };
};

const STAGES: Stage[] = [
  {
    key: "audit",
    icon: "🔍",
    label: "Audit",
    eyebrow: "Step 1 — Audit",
    title: (
      <>
        Where the business{" "}
        <span className="font-serif italic text-amber">actually</span> stands
      </>
    ),
    desc: "A free Discovery Call, then a scored Blueprint Call — surfacing what's tribal knowledge, what breaks when you're out, and what it's costing you.",
    checklist: [
      "Runs a normal week without you?",
      "Handoffs documented, not tribal?",
      "Output drops when key people are out?",
      "Pricing current, not stale?",
    ],
    mock: {
      label: "Discovery Call — Live Signal Read",
      title: "Dependency Signals",
      sub: "Captured during the call, scored after",
      rows: [
        { name: "Runs without owner", badge: "No", type: "warn" },
        { name: "Job handoffs documented", badge: "No", type: "warn" },
        { name: "Crew turnover this year", badge: "3×", type: "warn" },
        { name: "Pricing vs. current cost", badge: "Outdated", type: "warn" },
      ],
    },
  },
  {
    key: "blueprint",
    icon: "📐",
    label: "Blueprint",
    eyebrow: "Step 2 — Blueprint",
    title: (
      <>
        The scorecard <span className="font-serif italic text-amber">and</span> the fix
      </>
    ),
    desc: "Not just a diagnosis. The Operational Blueprint report ranks your top fixes in order, so the next step is obvious instead of overwhelming.",
    checklist: [
      "Dependency score, in plain numbers",
      "Top 5 fixes, ranked by impact",
      "Track assigned: Systemize / Augment / Scale",
      "Delivered 2–3 days after the call",
    ],
    mock: {
      label: "Operational Blueprint — Preview",
      title: "Track: Systemize",
      sub: "Dependency Score",
      bar: 32,
      rows: [
        { name: "1. Document quote-to-close handoff", badge: "High", type: "warn" },
        { name: "2. Fix stale supplier pricing", badge: "High", type: "warn" },
        { name: "3. Compliance expiry tracking", badge: "Med", type: "pending" },
      ],
    },
  },
  {
    key: "solution",
    icon: "🛠️",
    label: "Solution",
    eyebrow: "Step 3 — Solution",
    title: (
      <>
        The systems get <span className="font-serif italic text-amber">built</span>
      </>
    ),
    desc: "Five fixed-scope modules, milestone-billed, built around your crew's real workflow — not a generic platform bolted onto chaos.",
    checklist: [
      "Bid Vault & Extraction Engine",
      "Automated Sourcing Directory",
      "Multi-Agency Compliance Shield",
      "Authority & Cash Rhythm",
    ],
    mock: {
      label: "Implementation Sprint — Module Status",
      title: "5 Modules · ₱100K–150K each",
      sub: "Milestone-billed, built in sequence",
      rows: [
        { name: "Bid Vault & Extraction", badge: "In Progress", type: "warn" },
        { name: "Sourcing Directory", badge: "Queued", type: "pending" },
        { name: "Compliance Shield", badge: "Queued", type: "pending" },
        { name: "Authority & Cash Rhythm", badge: "Queued", type: "pending" },
      ],
    },
  },
  {
    key: "support",
    icon: "🔧",
    label: "Support",
    eyebrow: "Step 4 — Support",
    title: (
      <>
        It keeps running <span className="font-serif italic text-amber">after</span> we leave
      </>
    ),
    desc: "A retainer, not another dependency. Month one is free post-signoff — then scoped support so the system doesn't quietly decay.",
    checklist: [
      "Month 1 free post-handover",
      "₱5,000–20,000/month by scope",
      "Annual = 10× monthly, not 12×",
      "Named human reviewer on every deliverable",
    ],
    mock: {
      label: "Retainer — Status",
      title: "CADCC — Active Retainer",
      sub: "Scope: Core admin + compliance",
      rows: [
        { name: "SLA response time", badge: "< 24h", type: "ok" },
        { name: "Open tickets", badge: "0", type: "ok" },
        { name: "Next check-in", badge: "Queued", type: "pending" },
      ],
    },
  },
];

const BADGE_STYLES: Record<BadgeType, React.CSSProperties> = {
  warn: { background: "var(--color-amber-soft)", color: "var(--color-amber)" },
  pending: { background: "var(--color-slate-soft)", color: "var(--color-slate)" },
  ok: { background: "var(--color-green-soft)", color: "var(--color-green)" },
};

export default function Phases() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active];

  return (
    <section id="phases" className="py-28 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="annot">The Engagement</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight">
            Four Steps. One Framework.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            A system that{" "}
            <span className="font-serif italic" style={{ color: "var(--color-amber)" }}>
              outlasts you.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-10">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(i)}
              className="text-center rounded-2xl border px-3.5 py-5 transition"
              style={
                i === active
                  ? { borderColor: "var(--color-amber)", boxShadow: "0 0 0 1px var(--color-amber)", background: "var(--color-white-faint)" }
                  : { borderColor: "var(--color-white-soft)", background: "var(--color-white-faint)" }
              }
            >
              <div
                className="w-10 h-10 rounded-[10px] mx-auto mb-3 flex items-center justify-center text-lg"
                style={{ background: "var(--color-amber-soft)" }}
              >
                {s.icon}
              </div>
              <div
                className="text-[10.5px] font-bold tracking-wide mb-1"
                style={{ color: i === active ? "var(--color-amber)" : "var(--color-slate)" }}
              >
                STEP {i + 1}
              </div>
              <div className="text-[14.5px] font-bold text-white">{s.label}</div>
            </button>
          ))}
        </div>

        <div className="card-dark rounded-2xl p-8 md:p-10 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-[26px] font-bold leading-tight mb-3">{stage.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">{stage.desc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-7">
              {stage.checklist.map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[13.5px] text-slate-300 leading-snug">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold mt-0.5"
                    style={{ background: "var(--color-amber-soft)", color: "var(--color-amber)" }}
                  >
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <a
              href={BOOK_STRATEGY_SESSION_URL}
              className="btn-primary inline-flex items-center gap-2 text-black font-bold text-sm px-6 py-3 rounded-[10px]"
            >
              Book the Discovery Call
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 p-5 flex flex-col gap-3.5" style={{ background: "var(--color-bg-mid)" }}>
            <div className="annot" style={{ color: "var(--color-slate)" }}>
              {stage.mock.label}
            </div>

            <div className="rounded-[10px] border border-white/10 bg-white/[.02] px-4 py-3.5">
              <div className="text-[13px] font-bold text-white mb-1">{stage.mock.title}</div>
              <div className="text-[11.5px] text-slate-400">{stage.mock.sub}</div>
              {stage.mock.bar !== undefined && (
                <div className="h-1.5 rounded-full bg-white/10 mt-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${stage.mock.bar}%`, background: "var(--color-amber)" }}
                  />
                </div>
              )}
            </div>

            <div className="rounded-[10px] border border-white/10 bg-white/[.02] px-4 divide-y divide-white/10">
              {stage.mock.rows.map((row) => (
                <div key={row.name} className="flex items-center justify-between py-2.5 text-[12.5px]">
                  <span className="text-slate-300">{row.name}</span>
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={BADGE_STYLES[row.type]}
                  >
                    {row.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
