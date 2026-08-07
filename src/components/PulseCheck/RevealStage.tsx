import { TRACK_COPY, type Track } from "./utils/constants";

export default function RevealStage({ track, onBook }: { track: Track; onBook: () => void }) {
  return (
    <div className="text-center">
      <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-2.5">
        Your Pulse Check Result
      </div>
      <div className="font-serif italic text-[44px] leading-[1.1] text-amber mb-5">{track}</div>
      <p className="text-base leading-[1.65] text-slate-400 max-w-[440px] mx-auto mb-7">
        {TRACK_COPY[track]}
      </p>
      <button
        type="button"
        onClick={onBook}
        className="btn-primary inline-block text-black font-bold text-[15px] px-8 py-[15px] rounded-[10px]"
      >
        Book your Strategy Call
      </button>
    </div>
  );
}
