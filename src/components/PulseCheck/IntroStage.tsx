export default function IntroStage({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <p className="text-base leading-[1.65] text-slate-300 max-w-[440px] mx-auto mb-7">
        Before we talk, let&rsquo;s see where you actually stand. Eight
        questions, about two minutes.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="btn-primary inline-block text-black font-bold text-[15px] px-8 py-[15px] rounded-[10px]"
      >
        Start the Pulse Check
      </button>
    </div>
  );
}
