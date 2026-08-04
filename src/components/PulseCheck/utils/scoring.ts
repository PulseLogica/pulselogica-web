import { QUESTIONS, type Track } from "./constants";

export function buildPulsePath(progressFraction: number, segCount: number) {
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

export function scoreSlider(unit: string, rawVal: number) {
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

export function scoreFor(question: (typeof QUESTIONS)[number], raw: number) {
  return question.type === "choice" ? raw : scoreSlider(question.unit, raw);
}

export function computeScoring(rawAnswers: (number | undefined)[]) {
  const scores = rawAnswers.map((raw, i) => (raw === undefined ? undefined : scoreFor(QUESTIONS[i], raw)));
  const dependencyScores = scores.slice(0, 4).filter((s): s is number => s !== undefined);
  const urgencyScores = scores.slice(4, 8).filter((s): s is number => s !== undefined);
  const depAvg = dependencyScores.reduce((a, b) => a + b, 0) / (dependencyScores.length || 1);
  const urgAvg = urgencyScores.reduce((a, b) => a + b, 0) / (urgencyScores.length || 1);
  const overall = (depAvg + urgAvg) / 2;
  const hotLead = depAvg <= 1 && urgAvg <= 1;

  let track: Track = "Systemize";
  if (overall < 1.25) track = "Systemize";
  else if (overall < 2.25) track = "Augment";
  else track = "Scale";

  return { scores, depAvg, urgAvg, overall, hotLead, track };
}
