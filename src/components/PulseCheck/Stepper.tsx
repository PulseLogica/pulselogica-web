export default function Stepper({
  count,
  current,
  answeredCount,
  onStepClick,
}: {
  count: number;
  current: number;
  answeredCount: number;
  onStepClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: count }).map((_, i) => {
        const isCurrent = i === current;
        const isAnswered = i < answeredCount;
        const isClickable = isAnswered || isCurrent;

        return (
          <button
            key={i}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick(i)}
            aria-label={`Question ${i + 1}`}
            aria-current={isCurrent ? "step" : undefined}
            className="h-6 w-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition disabled:cursor-not-allowed"
            style={
              isCurrent
                ? { background: "var(--color-amber)", color: "#000" }
                : isAnswered
                ? { border: "1.5px solid var(--color-amber)", color: "var(--color-amber)" }
                : { border: "1.5px solid rgba(148,163,184,0.3)", color: "var(--color-slate)" }
            }
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
