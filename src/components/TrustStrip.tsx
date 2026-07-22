export default function TrustStrip() {
  return (
    <section className="border-t border-white/10 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="annot text-center mb-8">Built on real operations, not a pitch deck</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-90">
          <div className="text-center px-4">
            <div className="text-sm text-slate-300">
              We ran our own construction company through this first
            </div>
          </div>
          <div className="text-center px-4 sm:border-x sm:border-white/10">
            <div className="text-sm text-slate-300">
              Built on Anthropic&rsquo;s 4D AI Fluency framework
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-sm text-slate-300">
              Every deliverable ships with a named human reviewer
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
