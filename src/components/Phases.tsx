export default function Phases() {
  return (
    <section id="phases" className="py-28 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <span className="annot">The Engagement</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight">
            Three Steps. One Framework.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            A system that{" "}
            <span className="font-serif italic" style={{ color: "var(--color-amber)" }}>
              outlasts you.
            </span>
          </p>
        </div>

        {/* Phase 1: text left / visual right */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-32">
          <div>
            <div className="annot mb-4" style={{ color: "var(--color-amber)" }}>
              Phase One — We Find Where It Breaks
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              We map out your real daily operations, pinpoint your pain
              points, and hand you a clear blueprint to scale your business.
            </h3>
          </div>
          <div className="card-dark rounded-2xl p-8">
            <div className="annot mb-6" style={{ color: "var(--color-slate)" }}>
              The dependency map
            </div>
            <svg viewBox="0 0 300 260" width="100%">
              <line x1="150" y1="130" x2="150" y2="40" stroke="rgba(148,163,184,0.25)" strokeWidth={1.5} />
              <line x1="150" y1="130" x2="235" y2="99" stroke="rgba(148,163,184,0.25)" strokeWidth={1.5} />
              <line x1="150" y1="130" x2="199" y2="201" stroke="rgba(148,163,184,0.25)" strokeWidth={1.5} />
              <line x1="150" y1="130" x2="101" y2="201" stroke="rgba(148,163,184,0.25)" strokeWidth={1.5} />
              <line x1="150" y1="130" x2="65" y2="99" stroke="rgba(148,163,184,0.25)" strokeWidth={1.5} />

              <circle cx="150" cy="40" r="5.5" fill="var(--color-slate)" />
              <circle cx="235" cy="99" r="5.5" fill="var(--color-slate)" />
              <circle cx="199" cy="201" r="5.5" fill="var(--color-slate)" />
              <circle cx="101" cy="201" r="5.5" fill="var(--color-slate)" />
              <circle cx="65" cy="99" r="5.5" fill="var(--color-slate)" />

              <text x="150" y="26" textAnchor="middle" fill="var(--color-slate)" fontSize="11" fontFamily="Inter">Quotes</text>
              <text x="248" y="93" textAnchor="start" fill="var(--color-slate)" fontSize="11" fontFamily="Inter">Sourcing</text>
              <text x="199" y="222" textAnchor="middle" fill="var(--color-slate)" fontSize="11" fontFamily="Inter">Billing</text>
              <text x="101" y="222" textAnchor="middle" fill="var(--color-slate)" fontSize="11" fontFamily="Inter">Compliance</text>
              <text x="52" y="93" textAnchor="end" fill="var(--color-slate)" fontSize="11" fontFamily="Inter">Crew</text>

              <circle cx="150" cy="130" r="34" fill="var(--color-amber)" />
              <text x="150" y="135" textAnchor="middle" fill="#0A0F1D" fontSize="13" fontWeight="800" fontFamily="Inter">YOU</text>
            </svg>
            <div className="text-center text-white text-sm font-semibold mt-4">
              Every decision routes through one person.
            </div>
            <div className="text-center text-slate-500 text-xs mt-1.5">
              Step 1 finds exactly where — before we touch anything.
            </div>
          </div>
        </div>

        {/* Phase 2: visual left / text right */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-32">
          <div className="card-dark rounded-2xl p-8 md:order-1 order-2">
            <div className="annot mb-6" style={{ color: "var(--color-slate)" }}>
              Same AI. Different multiplier.
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[.02] text-center px-4 py-5">
                <div className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400 mb-3.5">
                  Undocumented
                </div>
                <div className="text-[26px] leading-none mb-3">☹ ☹ ☹</div>
                <div className="text-xs text-slate-500 mb-2.5">× AI</div>
                <div className="text-base font-bold text-slate-400 line-through decoration-slate-600">
                  Faster chaos
                </div>
              </div>
              <div
                className="rounded-xl text-center px-4 py-5 border"
                style={{ background: "rgba(255,122,0,.12)", borderColor: "var(--color-amber)" }}
              >
                <div className="text-[11.5px] font-semibold uppercase tracking-wide mb-3.5" style={{ color: "var(--color-amber)" }}>
                  Documented
                </div>
                <div className="text-[26px] leading-none mb-3">🙂 🙂 🙂</div>
                <div className="text-xs text-slate-500 mb-2.5">× AI</div>
                <div className="text-base font-bold" style={{ color: "var(--color-amber)" }}>
                  10x throughput
                </div>
              </div>
            </div>
            <p className="mt-6 text-center font-serif italic text-white text-base leading-snug">
              &ldquo;Bolt AI onto unmapped chaos, you just get faster chaos.&rdquo;
            </p>
          </div>
          <div className="md:order-2 order-1">
            <div className="annot mb-4" style={{ color: "var(--color-amber)" }}>
              Phase Two — We Lock the Strategy, Then We Build
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              AI can run a documented process 10x faster. The catch? Most
              businesses haven&rsquo;t written theirs down. That is exactly
              what we do.
            </h3>
          </div>
        </div>

        {/* Phase 3: text left / visual right */}
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="annot mb-4" style={{ color: "var(--color-amber)" }}>
              Phase Three — We Empower Your Team
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              We seamlessly hand over the keys to your team while remaining
              on standby as your trusted advisor. We train your crew on
              their actual workflow, hand over the playbook, and test it
              under real pressure.
            </h3>
          </div>
          <div className="card-dark rounded-2xl p-8">
            <div className="annot mb-6" style={{ color: "var(--color-slate)" }}>
              The handover
            </div>
            <div className="divide-y divide-white/10">
              {[
                { before: "Owner needed daily", after: "Written procedure" },
                { before: "Handoff by group chat", after: "Documented SOP" },
                { before: "New hire shadows owner", after: "Onboards from the doc" },
              ].map((row) => (
                <div key={row.before} className="flex items-center gap-3.5 py-4 first:pt-0 last:pb-0">
                  <div className="flex-1 text-sm text-slate-500 line-through decoration-slate-600">
                    {row.before}
                  </div>
                  <div className="text-sm text-slate-500">→</div>
                  <div className="flex-[1.3] flex items-center gap-2">
                    <div
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold"
                      style={{ background: "var(--color-amber)", color: "#0A0F1D" }}
                    >
                      ✓
                    </div>
                    <span className="text-white text-sm font-semibold">{row.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
