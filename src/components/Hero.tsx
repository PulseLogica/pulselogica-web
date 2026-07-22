export default function Hero() {
  return (
    <header className="relative overflow-hidden pt-28 pb-32 px-6">
      <div className="grid-overlay absolute inset-0"></div>

      <div className="relative max-w-3xl mx-auto text-center">
        <span className="annot inline-block mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/[.03]">
          AI Operational Strategy
        </span>

        <div className="relative flex justify-center my-14">
          <div className="glow-cube"></div>
          <div className="pulse-line w-40" style={{ top: 60, left: "calc(50% - 220px)" }}></div>
          <div className="pulse-line w-40" style={{ top: 60, right: "calc(50% - 220px)" }}></div>
          <div className="pulse-line w-24" style={{ top: 30, left: "calc(50% - 140px)", opacity: 0.3 }}></div>
          <div className="pulse-line w-24" style={{ top: 90, right: "calc(50% - 140px)", opacity: 0.3 }}></div>
        </div>

        <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.05]">
          Where your{" "}
          <span className="font-serif italic" style={{ color: "#FF7A00" }}>
            pulse
          </span>{" "}
          becomes logic.
        </h1>
        <p className="mt-7 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          AI consulting for SMEs. We build it. We integrate it. You run the company.
        </p>

        <div className="mt-11 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#book" className="btn-primary text-black font-semibold text-[15px] px-8 py-4 rounded-lg">
            Book Strategy Session
          </a>
          <a href="#proof" className="btn-secondary text-white font-semibold text-[15px] px-8 py-4 rounded-lg">
            View examples
          </a>
        </div>
      </div>
    </header>
  );
}
