export type Phase = { label: string; body: string };
export type StackItem = { name: string; description: string };
export type BeforeAfter = { label: string; before: string; after: string };

export type CaseStudyDetail = {
  slug: string;
  client: string;
  engagement: string;
  title: string;
  dek: string;
  challengeHeading: string;
  challengeBody: string;
  findingsLabel: string;
  findings: string[];
  approachHeading: string;
  phases: Phase[];
  milestones: string[];
  stackHeading: string;
  stackIntro: string;
  stack: StackItem[];
  beforeAfterHeading: string;
  beforeAfter: BeforeAfter[];
  ctaHeading: string;
  ctaBody: string;
};

export const caseStudies: CaseStudyDetail[] = [
  {
    slug: "construction-company",
    client: "Construction SME (Beachhead Tier 1 Client)",
    engagement: "Diagnostic + Implementation Sprint (Systemize)",
    title: "What Happens When the Business Only Runs Through You",
    dek: "How PulseLogica documented, de-bottlenecked, and rebuilt the operating backbone of a founder-run construction company — before touching a single tool.",
    challengeHeading: "A Business That Only Ran Through One Person",
    challengeBody:
      "A family-founded construction company. Like most project-based SMEs in the Philippines, it grew the way most do — through the owner's judgment, relationships, and memory. Bids got priced because the owner knew what materials cost that week. Crews got deployed because the owner knew who was reliable. Job handoffs happened in group chats and hallway conversations, not documents. That model works. It also has a ceiling: the business can only move as fast, and as far, as the owner can personally show up.",
    findingsLabel: "What the Diagnostic Surfaced",
    findings: [
      "Quote-to-close-out was tribal knowledge — no single place a new hire, a subcontractor, or a bank could look to see how a job actually moved from bid to handover; it lived in people's heads and scattered chat threads",
      "A management layer had been tried before and quietly reverted — responsibility drifted back to the owner because the systems underneath the layer weren't there to support it; the manager had authority but no documented process to run",
      "Output visibly dropped whenever a key person was out — not because the team wasn't capable, but because nothing was written down for them to run without a work-around",
    ],
    approachHeading: "What Changed",
    phases: [
      {
        label: "Documenting the operation before touching any tooling",
        body: "Mapping the real quote → execution → close-out flow as it actually happened, not as anyone assumed it happened. Identifying the champion for each process step — the person who could own it going forward, not just execute it once. Converting recurring judgment calls (bid pricing, crew sourcing, compliance sign-off) into documented, repeatable steps.",
      },
      {
        label: "Only after that: layering in tools",
        body: "Tools were introduced to make the documented process faster — not the other way around.",
      },
    ],
    milestones: [
      "Real quote-to-close-out flow mapped and documented",
      "Named champion identified for each process step",
      "Recurring judgment calls converted into documented, repeatable procedures",
      "Tooling layered in only after the process was proven on paper",
    ],
    stackHeading: "The Result",
    stackIntro:
      "The company now runs day-to-day operations without the owner physically present for each decision. The business didn't get an app first — it got a set of processes a person other than the founder could run with confidence. That's the foundation everything else, including any future technology, sits on.",
    stack: [],
    beforeAfterHeading: "From Chaos to Continuity",
    beforeAfter: [
      { label: "Job handoff method", before: "Verbal / group chat", after: "Written procedure" },
      { label: "New hire onboarding", before: "Shadow the owner", after: "Documented SOP" },
    ],
    ctaHeading: "Your operation shouldn't run only through you.",
    ctaBody:
      "If a normal week at your company falls apart the moment you're unreachable, that's not a staffing problem. It's a documentation problem wearing a staffing costume. The fix isn't hiring more people who will run into the same wall — it's making the business legible enough that competent people can actually run it.",
  },
  {
    slug: "food-brand",
    client: "QSR Brand (Early-Stage Launch)",
    engagement: "Systems Design + Implementation (Centralize-First)",
    title: "The Cost of Running Every Store the Same Way, On Purpose",
    dek: "How PulseLogica centralized a QSR brand's operating stack before multi-location growth began — avoiding the drift most brands only notice after it's expensive to fix.",
    challengeHeading: "Growth That Usually Forks Without Anyone Deciding To",
    challengeBody:
      "This brand is in active launch phase. This isn't a \"we 3x'd margin\" story — those numbers aren't there yet, and pretending otherwise wouldn't hold up. This is a cost-avoidance story: what centralizing operations early prevented, before the cracks that usually show up at store 3, 4, or 5 had a chance to form. Most QSR brands scale by trial and error — a first store figures out its own way of doing things, a second store copies most of it but not all, and by the third store, \"how we do things\" has quietly forked into two or three versions. Nobody planned that. It just happens when systems aren't centralized before growth starts.",
    findingsLabel: "What We Did Differently",
    findings: [
      "Before this brand opened beyond its first location, the operating stack — point of sale, staff management, inventory logic — was built centrally, once, and designed to be the same system every store runs on",
      "That's a deliberate, systemized-before-execution choice, not an accident of sequencing",
    ],
    approachHeading: "What This Avoided (The Cost-Avoidance Case)",
    phases: [
      {
        label: "Because the systems were centralized from the start",
        body: "The brand sidesteps costs that typically show up later and are expensive to unwind: no parallel \"how store 2 does it\" vs. \"how store 1 does it\" reconciliation project down the line; no retraining cost when a manager moves between locations, since the system is identical, not \"similar\"; no duplicate tooling spend from stores independently picking their own point solutions; no blind spot on margin per location, because the reporting structure was built in from day one, not bolted on after someone asked \"wait, which store is actually profitable?\"",
      },
      {
        label: "Why none of this shows up as a line item",
        body: "None of this shows up as a number on a P&L labeled \"savings.\" It shows up as problems that simply never had to get solved, because they were designed out before they could exist.",
      },
    ],
    milestones: [
      "One shared operating stack — POS, staff management, inventory logic — built before a second store opened",
      "No store-to-store reconciliation project needed",
      "No retraining cost when managers move between locations",
      "Per-location margin visibility built in from day one",
    ],
    stackHeading: "Why This Matters to You",
    stackIntro:
      "If you're pre-scale, the cheapest time to fix operational fragmentation is before it exists. The expensive version of this story is the one where a founder discovers at store 5 that every location is quietly running its own version of the business — and now has to unwind years of drift instead of avoiding it.",
    stack: [],
    beforeAfterHeading: "From First Store to System",
    beforeAfter: [
      { label: "Point of sale", before: "Not yet centralized", after: "One shared system across stores" },
      { label: "Staff onboarding", before: "Per-store", after: "One standard system" },
      { label: "Margin visibility", before: "Not built in", after: "Per-store, from launch" },
      { label: "Store-opening process", before: "Undefined", after: "Documented, repeatable" },
    ],
    ctaHeading: "Growing fast shouldn't mean growing apart.",
    ctaBody:
      "PulseLogica designs the operating system before the second location opens — so every store you add runs the same way as the first, not its own version of it.",
  },
];

export function getCaseStudy(slug: string): CaseStudyDetail | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
