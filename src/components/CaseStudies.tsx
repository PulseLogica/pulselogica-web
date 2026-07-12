const cases = [
  {
    tag: "Illustrative — Metro Manila",
    industry: "Retail Distribution",
    headline: "From owner-approved every order to a self-running fulfillment system.",
    body: "A multi-branch distributor where every purchase order needed the owner's sign-off, even for repeat vendors. We documented approval logic into rules, implemented an automated PO workflow, and cut owner touchpoints by a large majority — without losing control over exceptions.",
  },
  {
    tag: "Illustrative — Cavite",
    industry: "Manufacturing SME",
    headline: "Production scheduling that no longer lived in one supervisor's notebook.",
    body: "Scheduling and material tracking existed only in a supervisor's handwritten log. We digitized and documented the real scheduling logic, then implemented a shared system the whole floor could see and update in real time.",
  },
];

export default function CaseStudies() {
  return (
    <section id="cases" className="bg-ink py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-logic mb-4">
          Case Studies
        </div>
        <h2 className="font-mono font-bold text-2xl md:text-3xl text-paper max-w-2xl mb-4">
          What this looks like in practice.
        </h2>
        <p className="font-serif text-sm text-paper/50 mb-14 max-w-xl">
          These two are illustrative scenarios built from common Philippine
          SME patterns — real client case studies will replace these as
          engagements complete.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.industry}
              className="bg-paper/5 border border-paper/10 rounded-lg p-8"
            >
              <span className="inline-block font-mono text-[10px] uppercase tracking-wide bg-pulse/15 text-pulse px-2 py-1 rounded mb-4">
                {c.tag}
              </span>
              <div className="font-mono text-xs uppercase tracking-wide text-logic mb-2">
                {c.industry}
              </div>
              <h3 className="font-serif font-semibold text-lg text-paper mb-4 leading-snug">
                {c.headline}
              </h3>
              <p className="font-serif text-sm text-paper/60 leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
