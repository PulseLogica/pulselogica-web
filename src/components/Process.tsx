const steps = [
  {
    n: "01",
    title: "Diagnose",
    body: "We map how the business actually runs today — not the org chart version, the real one.",
  },
  {
    n: "02",
    title: "Document",
    body: "Undocumented knowledge becomes a written, repeatable system anyone can follow.",
  },
  {
    n: "03",
    title: "Build",
    body: "We implement the AI tools and automation that carry out the documented system.",
  },
  {
    n: "04",
    title: "Handover",
    body: "Your team runs it. You stay the decision-maker — the system just no longer needs you in the room.",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-paper py-24 border-b border-line">
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
          How We Work
        </div>
        <h2 className="font-mono font-bold text-2xl md:text-3xl text-ink max-w-2xl mb-14">
          A process, not a project drop-off.
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="font-mono text-3xl font-bold text-pulse/30 mb-4">
                {s.n}
              </div>
              <h3 className="font-mono font-bold text-base text-ink mb-2 uppercase tracking-wide">
                {s.title}
              </h3>
              <p className="font-serif text-sm text-ink/70 leading-relaxed">
                {s.body}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 -right-4 w-8 h-px bg-line" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
