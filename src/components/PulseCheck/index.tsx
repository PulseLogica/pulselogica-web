"use client";

import { useState } from "react";
import { QUESTIONS } from "./utils/constants";
import type { ContactFormValues } from "./utils/schema";
import { buildPulsePath, computeScoring, scoreFor } from "./utils/scoring";
import IntroStage from "./IntroStage";
import QuizStage from "./QuizStage";
import ContactForm from "./ContactForm";
import RevealStage from "./RevealStage";
import BookingCalendar from "./BookingCalendar";

type Stage = "intro" | "quiz" | "form" | "reveal" | "booking";

export default function PulseCheck() {
  const [current, setCurrent] = useState(0);
  const [rawAnswers, setRawAnswers] = useState<(number | undefined)[]>(
    Array(QUESTIONS.length).fill(undefined)
  );
  const [stage, setStage] = useState<Stage>("intro");
  const [contact, setContact] = useState<ContactFormValues | null>(null);
  const [clickupTaskId, setClickupTaskId] = useState<string | null>(null);

  const question = QUESTIONS[current];
  const firstUnanswered = rawAnswers.findIndex((a) => a === undefined);
  const answeredSoFar = firstUnanswered === -1 ? QUESTIONS.length : firstUnanswered;
  const progress = buildPulsePath(current / QUESTIONS.length, QUESTIONS.length);

  function recordAnswer(index: number, raw: number) {
    const next = [...rawAnswers];
    next[index] = raw;
    setRawAnswers(next);

    if (index + 1 < QUESTIONS.length) {
      setCurrent(index + 1);
    } else {
      setTimeout(() => setStage("form"), 350);
    }
  }

  function goToStep(index: number) {
    setCurrent(index);
  }

  const { track, hotLead, depAvg, urgAvg, overall } = computeScoring(rawAnswers);

  async function handleContactSubmit(contact: ContactFormValues) {
    const payload = {
      contact,
      answers: QUESTIONS.map((q, i) => {
        const raw = rawAnswers[i];
        const answerLabel =
          raw === undefined
            ? undefined
            : q.type === "choice"
            ? q.options[raw]
            : `${raw}${raw === q.max ? "+" : ""} ${q.unit}`;
        return {
          eyebrow: q.eyebrow,
          question: q.text,
          answer: answerLabel,
          score: raw === undefined ? undefined : scoreFor(q, raw),
        };
      }),
      depAvg,
      urgAvg,
      overall,
      track,
      hotLead,
    };

    try {
      const res = await fetch("/api/pulse-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setClickupTaskId(data.clickupTaskId ?? null);
    } catch (err) {
      console.error("Pulse Check sync failed:", err);
    }
    setContact(contact);
    setStage("reveal");
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
        {stage === "intro" && <IntroStage onStart={() => setStage("quiz")} />}

        {stage === "quiz" && (
          <QuizStage
            current={current}
            question={question}
            totalQuestions={QUESTIONS.length}
            rawAnswers={rawAnswers}
            answeredSoFar={answeredSoFar}
            progress={progress}
            onAnswer={recordAnswer}
            onStepClick={goToStep}
          />
        )}

        {stage === "form" && <ContactForm onSubmit={handleContactSubmit} />}

        {stage === "reveal" && <RevealStage track={track} onBook={() => setStage("booking")} />}

        {stage === "booking" && contact && (
          <BookingCalendar contact={contact} clickupTaskId={clickupTaskId} onBooked={() => {}} />
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500/60 tracking-wide">
        Where your <span className="font-serif italic text-amber/70">pulse</span> becomes logic.
      </div>
    </div>
  );
}
