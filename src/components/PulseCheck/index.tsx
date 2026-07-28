"use client";

import { useState } from "react";
import { GOOGLE_CALENDAR_STRATEGY_SESSION } from "@/lib/constants";
import { QUESTIONS, TRACK_COPY, type SliderQuestion, type Track } from "./constants";

function buildPulsePath(progressFraction: number, segCount: number) {
  const totalW = 500;
  const midY = 27;
  const spikeH = 16;
  const segW = totalW / segCount;
  let d = `M0,${midY} `;
  const answeredSegs = Math.round(progressFraction * segCount);
  for (let i = 0; i < segCount; i++) {
    const x0 = i * segW;
    if (i < answeredSegs) {
      const xa = x0 + segW * 0.35;
      const xb = x0 + segW * 0.5;
      const xc = x0 + segW * 0.65;
      d += `L${xa},${midY} L${xb},${midY - spikeH} L${xc},${midY} `;
    } else {
      d += `L${x0 + segW},${midY} `;
    }
  }
  d += `L${totalW},${midY}`;
  return d;
}

function scoreSlider(unit: string, rawVal: number) {
  if (unit === "times") {
    if (rawVal >= 3) return 0;
    if (rawVal === 2) return 1;
    if (rawVal === 1) return 2;
    return 3;
  }
  if (unit === "weeks") {
    if (rawVal >= 6) return 0;
    if (rawVal >= 3) return 1;
    if (rawVal >= 1) return 2;
    return 3;
  }
  return 0;
}

function SliderQuestionBlock({
  question,
  onConfirm,
}: {
  question: SliderQuestion;
  onConfirm: (score: number) => void;
}) {
  const startVal = Math.round((question.min + question.max) / 2);
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
        onClick={() => onConfirm(scoreSlider(question.unit, val))}
        className="btn-primary block w-full text-black font-bold text-[15px] py-3.5 rounded-lg"
      >
        Continue
      </button>
    </div>
  );
}

export default function PulseCheck() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const question = QUESTIONS[current];
  const progress = buildPulsePath(current / QUESTIONS.length, QUESTIONS.length);

  function selectAnswer(score: number) {
    const next = [...answers, score];
    setAnswers(next);
    if (current + 1 < QUESTIONS.length) {
      setCurrent(current + 1);
    } else {
      setTimeout(() => setRevealed(true), 350);
    }
  }

  let track: Track = "Systemize";
  let hotLead = false;
  if (revealed) {
    const dependencyScores = answers.slice(0, 4);
    const urgencyScores = answers.slice(4, 8);
    const depAvg = dependencyScores.reduce((a, b) => a + b, 0) / dependencyScores.length;
    const urgAvg = urgencyScores.reduce((a, b) => a + b, 0) / urgencyScores.length;
    const overall = (depAvg + urgAvg) / 2;
    hotLead = depAvg <= 1 && urgAvg <= 1;

    if (overall < 1.25) track = "Systemize";
    else if (overall < 2.25) track = "Augment";
    else track = "Scale";

    // eslint-disable-next-line no-console
    console.log("Pulse Check result (internal):", { depAvg, urgAvg, hotLead });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 relative">
      <div className="absolute top-7 left-1/2 -translate-x-1/2 flex items-center gap-2 annot">
        <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-[1px]"
              style={{ background: i === 2 ? "var(--color-amber)" : "rgba(148,163,184,0.3)" }}
            />
          ))}
        </div>
        PULSELOGICA
      </div>

      <div className="card-dark w-full max-w-[560px] rounded-[18px] px-9 pt-10 pb-8 relative">
        {!revealed ? (
          <>
            <div className="w-full h-[54px] mb-7 relative">
              <span className="absolute -top-[22px] right-0 text-[11px] tracking-[0.08em] text-slate-400 uppercase">
                Question {current + 1} of {QUESTIONS.length}
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
                {question.options.map((opt, idx) => (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(idx)}
                    className="text-left bg-white/[0.02] border border-white/10 hover:border-amber hover:bg-amber-soft text-cream font-medium text-[15px] px-[18px] py-[15px] rounded-[10px] transition active:scale-[0.99]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <SliderQuestionBlock question={question} onConfirm={selectAnswer} />
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-[11px] tracking-[0.12em] uppercase text-slate-400 mb-2.5">
              Your Pulse Check Result
            </div>
            <div className="font-serif italic text-[44px] leading-[1.1] text-amber mb-5">{track}</div>
            <p className="text-base leading-[1.65] text-slate-400 max-w-[440px] mx-auto mb-7">
              {TRACK_COPY[track]}
            </p>
            <a
              href={GOOGLE_CALENDAR_STRATEGY_SESSION}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block text-black font-bold text-[15px] px-8 py-[15px] rounded-[10px]"
            >
              Book your Strategy Call
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500/60 tracking-wide">
        Where your <span className="font-serif italic text-amber/70">pulse</span> becomes logic.
      </div>
    </div>
  );
}
