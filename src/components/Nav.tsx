export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-mono font-bold text-sm tracking-tight text-ink">
          PULSE<span className="text-pulse">·</span>LOGICA
        </div>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wide text-ink/70">
          <a href="#services" className="hover:text-ink transition-colors">Services</a>
          <a href="#process" className="hover:text-ink transition-colors">Process</a>
          <a href="#cases" className="hover:text-ink transition-colors">Case Studies</a>
          <a href="#values" className="hover:text-ink transition-colors">Values</a>
        </div>
        <a
          href="#cta"
          className="font-mono text-xs uppercase tracking-wide bg-ink text-paper px-4 py-2 rounded-md hover:bg-ink/90 transition-colors"
        >
          Book a Call
        </a>
      </div>
    </nav>
  );
}
