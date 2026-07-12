const problems = [
  {
    title: "If you disappear for a week, does the business stall?",
    body: "Most SME operations live in one person's head — the owner's. Pricing decisions, vendor relationships, approval chains. None of it is written down.",
  },
  {
    title: "Are your best processes tribal knowledge?",
    body: "The employee who knows how things really work is one resignation away from taking that knowledge with them.",
  },
  {
    title: "Is 'AI adoption' just a tool nobody uses?",
    body: "Software gets bought, logins get created, and six months later everyone's back to spreadsheets and group chats.",
  },
];

export default function Problem() {
  return (
    <section className="bg-paper py-24 border-b border-line">
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
          The Problem
        </div>
        <h2 className="font-mono font-bold text-2xl md:text-3xl text-ink max-w-2xl mb-14">
          Undocumented operations don&rsquo;t scale. They just get more
          fragile.
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div key={p.title}>
              <h3 className="font-serif font-semibold text-lg text-ink mb-3 leading-snug">
                {p.title}
              </h3>
              <p className="font-serif text-sm text-ink/70 leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
