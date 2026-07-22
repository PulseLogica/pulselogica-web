import { GOOGLE_CALENDAR_STRATEGY_SESSION } from "@/lib/constants";

export default function MobileStickyCta() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 backdrop-blur-xl bg-black/60 border-t border-white/10">
      <a
        href={GOOGLE_CALENDAR_STRATEGY_SESSION}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary block text-center text-black font-semibold text-sm py-3.5 rounded-lg"
      >
        Book Strategy Session
      </a>
    </div>
  );
}
