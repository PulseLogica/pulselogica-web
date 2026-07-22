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
    slug: "cadcc",
    client: "CAD Construction Corporation (CADCC)",
    engagement: "Diagnostic + Implementation Sprint (Systemize)",
    title: "Systemizing the Business Behind a Family Construction Company",
    dek: "How PulseLogica documented, de-bottlenecked, and rebuilt the operating backbone of a founder-run construction company — before touching a single tool.",
    challengeHeading: "A Business That Only Ran Through One Person",
    challengeBody:
      "CADCC operated the way most project-based construction SMEs in the Philippines do: quotes were priced from memory, crews were deployed based on who the owner personally trusted, and job handoffs lived in group chats instead of documents. A management layer had been introduced once before, but it didn't hold — there was no underlying process for a manager to actually run. When the owner was unavailable, output visibly dropped. PulseLogica was brought in to systemize the operation from the ground up, using CADCC as its own first proof of concept.",
    findingsLabel: "What the Diagnostic Found",
    findings: [
      "No documented flow from bid to project close-out",
      "Job handoff knowledge held entirely by the owner and a handful of long-tenured staff",
      "A previously attempted management layer that reverted back to owner-run",
      'Bid pricing based on "what it usually costs," not current material and labor rates',
      "No visibility into margin per job until after it closed",
    ],
    approachHeading: "Two Phases, One System",
    phases: [
      {
        label: "Phase 1: Diagnose + Document",
        body: "Run the full operational diagnostic against CADCC using the same five-pillar instrument used with every client. Map the real quote-to-close-out flow as it happens, not as assumed. Identify a named champion for every process step — hard stop if no champion can be named.",
      },
      {
        label: "Phase 2: Systemize + Sequence Tooling",
        body: "Convert every recurring judgment call into a documented, repeatable procedure. Only once the process is proven on paper, layer in tooling to remove friction — never the reverse.",
      },
    ],
    milestones: [
      "Bid pricing procedure rebuilt against current material/labor rates",
      "Job handoff documentation replacing group-chat knowledge transfer",
      "Margin-per-job visibility built into close-out step",
      "Phase 2 tooling roadmap scoped",
    ],
    stackHeading: "The Operating Stack",
    stackIntro:
      "PulseLogica designed and sequenced the systems layer behind CADCC's operations: documented process, compliance tracking, and — where warranted — automation. Process first, tooling second, so nothing gets built on top of an undocumented workflow.",
    stack: [
      {
        name: "Bid Vault & Extraction Engine",
        description:
          "Centralizes bid documentation and material/labor rate data so pricing reflects current costs, not memory.",
      },
      {
        name: "Automated Sourcing Directory",
        description:
          'A structured, searchable record of crew and subcontractor sourcing — replacing "who does the owner know" with a documented directory.',
      },
      {
        name: "Multi-Agency Compliance Shield",
        description:
          "Tracks compliance obligations across the agencies a construction SME has to answer to, so nothing depends on one person remembering a renewal date.",
      },
      {
        name: "Core Administrative Tune-Up",
        description:
          "Cleans up the underlying administrative workflow — the unglamorous back-office work that determines whether the rest of the system holds.",
      },
    ],
    beforeAfterHeading: "From Chaos to Continuity",
    beforeAfter: [
      { label: "Job handoff method", before: "Verbal / group chat", after: "Written procedure" },
      { label: "New hire onboarding", before: "Shadow the owner", after: "Documented SOP" },
    ],
    ctaHeading: "Your operation shouldn't run only through you.",
    ctaBody:
      "PulseLogica documents and systemizes founder-dependent operations before layering on any tooling — so the business runs whether or not you're in the room.",
  },
  {
    slug: "featherweight-chicken",
    client: "Featherweight Chicken (FWT)",
    engagement: "Systems Design + Implementation (Centralize-First)",
    title: "Building One System Before Opening a Second Store",
    dek: "How PulseLogica centralized Featherweight Chicken's operating stack before multi-location growth began — avoiding the drift most QSR brands only notice after it's expensive to fix.",
    challengeHeading: "Growth That Usually Forks Without Anyone Deciding To",
    challengeBody:
      "Most QSR brands scale store by store, and each new location ends up running things a little differently — even when it starts out copying the first. Nobody decides to fragment operations; it just happens by default once growth outpaces documentation. FWT wanted its second, third, and future stores to run on the exact same system as the first, from day one — not a \"close enough\" copy of it.",
    findingsLabel: "What Was at Stake Before Launch",
    findings: [
      "No shared point-of-sale or staff system across future locations",
      "No centralized inventory or sales reporting structure",
      "No standard manager onboarding — every store would train its own way",
      "No per-store margin visibility built in from the start",
    ],
    approachHeading: "Centralize First, Then Scale",
    phases: [
      {
        label: "Phase 1: Build the Shared System",
        body: "Design and deploy one operating stack — POS, staff app, inventory logic — before a second store opens. Every store built to run on the same system, not a \"similar\" one.",
      },
      {
        label: "Phase 2: Standardize the Rollout",
        body: "Build manager onboarding and store-opening procedures around the single system, so every new location launches on identical infrastructure instead of reinventing its own version.",
      },
    ],
    milestones: [
      "FWT POS deployed as the single point-of-sale system",
      "FWTeam App deployed for staff management across locations",
      "Centralized inventory and reporting logic built pre-launch",
      "Standard store-opening and manager onboarding procedure documented",
      "Per-location margin visibility built into reporting from day one",
    ],
    stackHeading: "The Tech Stack",
    stackIntro:
      "PulseLogica designed and deployed FWT's full operating infrastructure — point of sale, staff management, inventory, and reporting — as one connected system rather than a patchwork of per-store tools.",
    stack: [
      {
        name: "FWT POS",
        description:
          "The single point-of-sale system every store runs on, feeding the same reporting structure regardless of location.",
      },
      {
        name: "FWTeam App",
        description:
          "Staff management and scheduling built once, deployed identically at every store — no per-location retraining when staff transfer.",
      },
      {
        name: "Centralized Inventory Logic",
        description:
          "Inventory tracked against one shared structure, not reconciled after the fact across stores.",
      },
      {
        name: "Per-Store Reporting",
        description:
          "Margin and performance visible by location from the first day of operation, not bolted on after someone asks which store is actually profitable.",
      },
    ],
    beforeAfterHeading: "From First Store to System",
    beforeAfter: [
      { label: "Point of sale", before: "Not yet centralized", after: "One shared FWT POS" },
      { label: "Staff onboarding", before: "Per-store", after: "One system via FWTeam App" },
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
