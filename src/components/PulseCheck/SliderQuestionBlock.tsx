import { useState } from "react";
import type { SliderQuestion } from "./utils/constants";

export default function SliderQuestionBlock({
  question,
  initialValue,
  onConfirm,
}: {
  question: SliderQuestion;
  initialValue?: number;
  onConfirm: (raw: number) => void;
}) {
  const startVal = initialValue ?? Math.round((question.min + question.max) / 2);
  const [val, setVal] = useState(startVal);

  return (
    <div className="pt-1.5">
      <div className="font-serif italic text-4xl text-amber mb-6 text-center">
        {val}
        {val === question.max ? "+" : ""}
        <span className="text-base font-sans not-italic text-slate-400 ml-2">{question.unit}</span>
      </div>
      <input
        type="range"
        className="pulse-slider mb-2.5"
        min={question.min}
        max={question.max}
        value={val}
        onChange={(e) => setVal(parseInt(e.target.value, 10))}
      />
      <div className="flex justify-between text-xs text-slate-400 mb-6">
        <span>{question.minLabel}</span>
        <span>{question.maxLabel}</span>
      </div>
      <button
        onClick={() => onConfirm(val)}
        className="btn-primary block w-full text-black font-bold text-[15px] py-3.5 rounded-lg"
      >
        Continue
      </button>
    </div>
  );
}
