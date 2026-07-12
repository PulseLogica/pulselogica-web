export default function Hero() {
  return (
    <header className="bg-ink relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-28">
        <div className="font-mono text-xs uppercase tracking-widest text-logic mb-6">
          Systems for Philippine SMEs
        </div>
        <h1 className="font-mono font-bold text-4xl md:text-6xl leading-tight text-paper max-w-3xl">
          Your business runs <span className="text-pulse">without you</span> —{" "}
          <em className="not-italic text-paper/60">on purpose.</em>
        </h1>
        <p className="font-serif text-lg text-paper/70 max-w-xl mt-8 leading-relaxed">
          We convert owner-dependent, undocumented operations into documented,
          AI-enabled systems. You stay the decision-maker — we build the
          infrastructure that lets the business run without you physically
          present.
        </p>

        <div className="flex flex-wrap gap-4 mt-10">
          <a
            href="#cta"
            className="font-mono text-sm uppercase tracking-wide bg-pulse text-paper px-6 py-3 rounded-md hover:bg-pulse/90 transition-colors"
          >
            Book a Free Ops Assessment
          </a>
          <a
            href="#services"
            className="font-mono text-sm uppercase tracking-wide border border-paper/30 text-paper px-6 py-3 rounded-md hover:border-paper/60 transition-colors"
          >
            See What We Do
          </a>
        </div>

        {/* Signature: heartbeat line straightening into a circuit trace */}
        <svg
          className="mt-16 w-full max-w-2xl"
          viewBox="0 0 700 60"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0 30 L40 30 L52 8 L68 52 L84 30 L120 30
               L280 30 L292 8 L308 52 L324 30 L360 30
               L400 30 L400 14 L440 14 L440 46 L480 46 L480 30 L700 30"
            stroke="#E8785A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </header>
  );
}
