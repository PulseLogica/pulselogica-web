export default function CTAFooter() {
  return (
    <>
      <section id="cta" className="bg-paper py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-ink rounded-xl px-10 py-16 md:px-16 relative overflow-hidden">
            <h2 className="font-mono font-bold text-2xl md:text-4xl text-paper max-w-xl leading-tight mb-4">
              Let&rsquo;s find out what your business can run without you.
            </h2>
            <p className="font-serif text-paper/60 max-w-md mb-10">
              A free ops assessment — no pitch, just a look at where your
              operations are owner-dependent and what documenting them could
              unlock.
            </p>
            <a
              href="mailto:hello@pulselogica.com"
              className="inline-block font-mono text-sm uppercase tracking-wide bg-pulse text-paper px-6 py-3 rounded-md hover:bg-pulse/90 transition-colors"
            >
              Book a Free Ops Assessment
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-paper py-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-xs text-muted">
            Your <span className="text-pulse">Pulse</span>. Our{" "}
            <span className="text-logic">Logic</span>.
          </div>
          <div className="flex gap-6 font-mono text-xs text-muted">
            <a href="#services" className="hover:text-ink transition-colors">Services</a>
            <a href="#process" className="hover:text-ink transition-colors">Process</a>
            <a href="mailto:hello@pulselogica.com" className="hover:text-ink transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}
