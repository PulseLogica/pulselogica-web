const values = [
  { title: "Fast", body: "We move at the speed of your operations, not the speed of a typical consulting engagement." },
  { title: "Technical", body: "Real implementation, not slide decks. We build the thing." },
  { title: "Solutions-oriented", body: "We start from the problem, not from a product we're trying to sell you." },
  { title: "Easy", body: "You shouldn't need a manual to work with us. Plain language, clear scope, no jargon theater." },
  { title: "Approachable", body: "You stay in control of every decision. We're the systems team, not a black box." },
];

export default function Values() {
  return (
    <section id="values" className="bg-paper py-24 border-b border-line">
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
          How We Operate
        </div>
        <h2 className="font-mono font-bold text-2xl md:text-3xl text-ink max-w-2xl mb-14">
          Values, not a mission statement.
        </h2>

        <div className="grid md:grid-cols-5 gap-6">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="font-mono font-bold text-sm text-pulse mb-2 uppercase tracking-wide">
                {v.title}
              </h3>
              <p className="font-serif text-sm text-ink/70 leading-relaxed">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
