export type ChoiceQuestion = {
  type: "choice";
  eyebrow: string;
  text: string;
  emphasis?: string;
  options: string[];
};

export type SliderQuestion = {
  type: "slider";
  eyebrow: string;
  text: string;
  emphasis?: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  unit: string;
};

export type Question = ChoiceQuestion | SliderQuestion;

export const QUESTIONS: Question[] = [
  {
    type: "choice",
    eyebrow: "Running the Business",
    text: "If you disappeared for a week — no calls, no check-ins — would the business keep running",
    emphasis: "normally",
    options: [
      "It would stop",
      "The work continues, but decisions wait",
      "Mostly fine, only the big stuff waits",
      "It runs fine without me",
    ],
  },
  {
    type: "choice",
    eyebrow: "Running the Business",
    text: "If you hired someone new tomorrow, could they learn the job from written instructions — or would they have to keep",
    emphasis: "asking you",
    options: [
      "No instructions exist, they'd ask me",
      "Just scattered notes or old chat messages",
      "Some notes exist, but they're out of date",
      "Clear instructions exist and people actually use them",
    ],
  },
  {
    type: "choice",
    eyebrow: "Running the Business",
    text: "Has work ever slowed down just because one key person was",
    emphasis: "out",
    options: ["Yes, often", "Yes, noticeably", "Rarely", "No, someone else can always step in"],
  },
  {
    type: "choice",
    eyebrow: "Running the Business",
    text: "Have you ever put someone in charge of decisions, only to end up making those decisions",
    emphasis: "yourself anyway",
    options: [
      "Yes, almost right away",
      "Somewhat — it worked for some things",
      "Mostly, but I still get pulled into big decisions",
      "No, they handle it on their own",
    ],
  },
  {
    type: "choice",
    eyebrow: "Costs & Pricing",
    text: "Are your prices based on what things cost",
    emphasis: "today",
    options: [
      "Still using old prices",
      "We update sometimes",
      "We update often, but by hand",
      "Always up to date",
    ],
  },
  {
    type: "slider",
    eyebrow: "Team Stability",
    text: "How many times this year did you have to train someone new for the",
    emphasis: "same job",
    min: 0,
    max: 5,
    minLabel: "0 times",
    maxLabel: "5+ times",
    unit: "times",
  },
  {
    type: "choice",
    eyebrow: "Team Stability",
    text: "Your best team member right now — if someone offered them more money, would they",
    emphasis: "leave",
    options: ["Probably", "Maybe", "Probably not", "No, they're staying"],
  },
  {
    type: "slider",
    eyebrow: "Cash Flow",
    text: "When a client pays you late, how many weeks does it usually take before that delay hits your team or suppliers too?",
    min: 0,
    max: 8,
    minLabel: "0 weeks",
    maxLabel: "8+ weeks",
    unit: "weeks",
  },
];

export type Track = "Systemize" | "Augment" | "Scale";

export const TRACK_COPY: Record<Track, string> = {
  Systemize:
    "Right now, the business needs you for almost everything — and that's the real limit on growth, not lack of demand. The good news: this is fixable. It just means writing down and handing off the parts that only exist in your head right now.",
  Augment:
    "The basics are in place, but a few gaps are quietly slowing you down — probably around handoffs or cash timing. Worth fixing before you take on more work, so growth doesn't make the gaps worse.",
  Scale:
    "Your business can already run without you in the room. At this stage, it's less about fixing problems and more about deciding what to build next so growth doesn't outpace the system.",
};
