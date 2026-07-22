export default function CTAFooter() {
  return (
    <>
      <section id="book" className="py-28 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
            Build a company you can hand over —{" "}
            <span className="font-serif italic" style={{ color: "#FF7A00" }}>
              not a job you can&rsquo;t leave.
            </span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg">
            Select a time below to map your AI transition roadmap. No sales
            pitches. Just clear logic.
          </p>

          <div className="mt-14 rounded-2xl border border-white/10 bg-white/[.02] p-2">
            <div className="rounded-xl bg-black/30 border border-white/5 h-[480px] flex items-center justify-center text-slate-500 text-sm">
              [ Calendly embed goes here — replace with your scheduling link ]
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 px-6 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>PulseLogica</span>
          <span>kevin@pulselogica.com</span>
        </div>
      </footer>
    </>
  );
}
