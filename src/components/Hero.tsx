import { BOOK_STRATEGY_SESSION_URL, HERO_VIDEO_EMBED_URL } from "@/lib/constants";

const CHECKLIST = [
  "A clear starting point. Not another framework to figure out.",
  "Tested on real businesses, not slide decks.",
  "Clarity first. Tools and AI come after.",
];

export default function Hero() {
  return (
    <header className="relative overflow-hidden pt-28 pb-20 max-w-6xl mx-auto px-8">
      <div className="grid-overlay absolute inset-0"></div>

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Confusion is expensive.
            <br />
            <span style={{ color: "var(--color-amber)" }}>Clarity</span> is free.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
            You&rsquo;re the pulse this business runs on. But right now it&rsquo;s pulled in too
            many directions at once. One call. One clear starting point.
          </p>

          <ul className="mt-8 space-y-3">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold"
                  style={{ background: "var(--color-amber)", color: "#0A0F1D" }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <a
              href={BOOK_STRATEGY_SESSION_URL}
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-black font-semibold text-[15px] px-8 py-4 rounded-lg"
            >
              Book a Discovery Call
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="relative aspect-[16/10]">
            <iframe
              src={HERO_VIDEO_EMBED_URL}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        className="relative w-full h-8 mt-16"
      >
        <path
          d="M0,20 L540,20 L560,4 L580,36 L600,20 L1200,20"
          fill="none"
          stroke="var(--color-amber)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </header>
  );
}
