export default function Phases() {
  return (
    <section id="phases" className="py-28 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <span className="annot">The engagement</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight">
            Three phases. White-glove execution.
          </h2>
        </div>

        {/* Phase 1: text left / visual right */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-32">
          <div>
            <div className="annot mb-4" style={{ color: "#FF7A00" }}>
              Phase 1 — Dependency mapping
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              Find the founder-dependency paths.
              <br />
              Break the bottleneck.
            </h3>
            <p className="mt-5 text-slate-400 text-base leading-relaxed">
              Your business runs on hustle. We map exactly where — and where a
              normal week falls apart the moment you&rsquo;re not in it.
            </p>
            <div
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
              style={{ background: "rgba(255,122,0,.15)", color: "#FF7A00" }}
            >
              60-minute diagnostic call
            </div>
          </div>
          <div className="card-dark rounded-2xl p-8">
            <div className="annot mb-6" style={{ color: "#94A3B8" }}>
              Operational flow
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                Quote → owner approves
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400 pl-6">
                <span className="w-2 h-2 rounded-full bg-white/20"></span>
                Execution → group chat
              </div>
              <div className="flex items-center gap-3 text-sm" style={{ color: "#FF7A00" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#FF7A00" }}></span>
                Close-out → depends on memory
              </div>
              <div className="h-px bg-white/10 my-4"></div>
              <div className="flex items-center gap-3 text-sm text-white font-medium">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                Documented → runs without you
              </div>
            </div>
          </div>
        </div>

        {/* Phase 2: visual left / text right */}
        <div className="grid md:grid-cols-2 gap-14 items-center mb-32">
          <div className="card-dark rounded-2xl p-8 md:order-1 order-2">
            <div className="annot mb-6" style={{ color: "#94A3B8" }}>
              Before / after
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-light text-slate-500">6–8 wks</div>
                <div className="text-xs text-slate-500 mt-1">Typical documentation timeline</div>
              </div>
              <div>
                <div className="text-3xl font-light" style={{ color: "#FF7A00" }}>2–3 wks</div>
                <div className="text-xs text-slate-400 mt-1">With AI-assisted capture</div>
              </div>
            </div>
            <div className="h-px bg-white/10 my-5"></div>
            <div className="text-sm text-slate-400">No new engineering headcount required</div>
          </div>
          <div className="md:order-2 order-1">
            <div className="annot mb-4" style={{ color: "#FF7A00" }}>
              Phase 2 — System integration
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              Automate the mundane.
              <br />
              Retain the soul.
            </h3>
            <p className="mt-5 text-slate-400 text-base leading-relaxed">
              It can run on systems. We layer AI in only where the process is
              already documented — sequenced, not bolted on.
            </p>
          </div>
        </div>

        {/* Phase 3: text left / visual right */}
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="annot mb-4" style={{ color: "#FF7A00" }}>
              Phase 3 — The hand-off
            </div>
            <h3 className="text-3xl font-semibold leading-tight">
              A system tailor-made for your team, not your engineer.
            </h3>
            <p className="mt-5 text-slate-400 text-base leading-relaxed">
              We stay on until the new system holds under pressure — with your
              crew, your language, your workflow. Then we leave.
            </p>
          </div>
          <div className="card-dark rounded-2xl p-8">
            <div className="annot mb-6" style={{ color: "#94A3B8" }}>
              What your team sees
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Jobs on track this week</span>
                <span className="text-white font-medium">14 / 16</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Undocumented handoffs</span>
                <span className="font-medium" style={{ color: "#FF7A00" }}>0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Owner approvals pending</span>
                <span className="text-white font-medium">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
