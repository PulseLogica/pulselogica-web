import type { Question } from "./utils/constants";
import Stepper from "./Stepper";
import SliderQuestionBlock from "./SliderQuestionBlock";

export default function QuizStage({
  current,
  question,
  totalQuestions,
  rawAnswers,
  answeredSoFar,
  progress,
  onAnswer,
  onStepClick,
}: {
  current: number;
  question: Question;
  totalQuestions: number;
  rawAnswers: (number | undefined)[];
  answeredSoFar: number;
  progress: string;
  onAnswer: (index: number, raw: number) => void;
  onStepClick: (index: number) => void;
}) {
  return (
    <>
      <div className="w-full h-[54px] mb-2 relative">
        <span className="absolute -top-[22px] right-0 text-[11px] tracking-[0.08em] text-slate-400 uppercase">
          Question {current + 1} of {totalQuestions}
        </span>
        <svg viewBox="0 0 500 54" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <path d="M0,27 L500,27" fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={2} />
          <path
            d={progress}
            fill="none"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              stroke: "var(--color-amber)",
              filter: "drop-shadow(0 0 6px rgba(255,122,0,0.5))",
              transition: "d 0.6s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </svg>
      </div>

      <Stepper
        count={totalQuestions}
        current={current}
        answeredCount={answeredSoFar}
        onStepClick={onStepClick}
      />

      <div className="annot mb-3.5" style={{ color: "var(--color-amber)" }}>
        {question.eyebrow}
      </div>
      <div className="text-[22px] leading-[1.45] font-medium text-cream mb-7">
        {question.text}{" "}
        {question.emphasis && (
          <span className="font-serif italic font-normal text-amber text-2xl">
            {question.emphasis}
          </span>
        )}
        ?
      </div>

      {question.type === "choice" ? (
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, idx) => {
            const isSelected = rawAnswers[current] === idx;
            return (
              <button
                key={opt}
                onClick={() => onAnswer(current, idx)}
                className="text-left font-medium text-[15px] px-[18px] py-[15px] rounded-[10px] transition active:scale-[0.99] border"
                style={
                  isSelected
                    ? { borderColor: "var(--color-amber)", background: "rgba(255,122,0,.15)", color: "var(--color-white)" }
                    : { borderColor: "rgba(148,163,184,0.16)", background: "rgba(255,255,255,0.02)", color: "var(--color-white)" }
                }
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        <SliderQuestionBlock
          key={current}
          question={question}
          initialValue={rawAnswers[current]}
          onConfirm={(raw) => onAnswer(current, raw)}
        />
      )}
    </>
  );
}
