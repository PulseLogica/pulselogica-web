export default function Services() {
  return (
    <section id="services" className="bg-ink py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="font-mono text-xs uppercase tracking-widest text-logic mb-4">
          What We Do
        </div>
        <h2 className="font-mono font-bold text-2xl md:text-3xl text-paper max-w-2xl mb-14">
          Two ways we make your business run without you.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-paper/5 border border-paper/10 rounded-lg p-8">
            <div className="font-mono text-xs uppercase tracking-wide text-pulse mb-3">
              Lead Offer
            </div>
            <h3 className="font-mono font-bold text-xl text-paper mb-4">
              AI &amp; Tech Stack Implementation
            </h3>
            <p className="font-serif text-sm text-paper/70 leading-relaxed mb-6">
              We audit how your business actually runs, document the real
              workflow, then implement the AI tools and automation that
              replace manual, owner-dependent steps — without disrupting
              operations mid-build.
            </p>
            <ul className="font-serif text-sm text-paper/60 space-y-2">
              <li>— Operations audit &amp; documentation</li>
              <li>— AI tool selection &amp; implementation</li>
              <li>— Workflow automation setup</li>
              <li>— Team training &amp; handover</li>
            </ul>
          </div>

          <div className="bg-paper/5 border border-paper/10 rounded-lg p-8">
            <div className="font-mono text-xs uppercase tracking-wide text-logic mb-3">
              Proof of Capability
            </div>
            <h3 className="font-mono font-bold text-xl text-paper mb-4">
              Custom Operational Builds
            </h3>
            <p className="font-serif text-sm text-paper/70 leading-relaxed mb-6">
              For businesses that need something purpose-built — a custom
              internal tool, dashboard, or system — designed and built
              specifically around how your operation works.
            </p>
            <ul className="font-serif text-sm text-paper/60 space-y-2">
              <li>— Custom internal tools &amp; dashboards</li>
              <li>— Purpose-built systems &amp; integrations</li>
              <li>— Direct-to-need engineering</li>
              <li>— Ongoing support &amp; iteration</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
