export type CaseStudy = {
  slug: string;
  title: string;
  challenge: string;
  solutionIntro: string;
  solution: string[];
  infrastructure: string[];
  impact: string;
};

export const cases: CaseStudy[] = [
  {
    slug: "construction-company",
    title: "Operational Continuity System — Construction SME",
    challenge:
      "A family construction business ran the way a lot of them do — almost everything passed through the owner's head. Bids, crew assignments, job handoffs: mostly tribal knowledge and group chats, nothing written down. A manager was brought in once to help, but it didn't stick because there was no clear process to hand over. When the owner wasn't around, work slowed down.",
    solutionIntro:
      "PulseLogica documented how the business actually operates, before bringing in any new tools:",
    solution: [
      "Mapped the real process from bid to project close-out",
      "Identified who should own each step — not just do it, but be accountable for it",
      "Wrote down decisions that used to live only in the owner's head (bid pricing, crew selection, compliance sign-off)",
      "Only added tools once the process itself was proven on paper",
    ],
    infrastructure: [
      "A written process from quote to turnover",
      "Clear owners for each step, not just the founder",
      "Answers on paper for decisions that used to mean \"ask the boss\"",
    ],
    impact:
      "The business can now run day-to-day even when the owner isn't on-site. The team no longer has to wait on one person to keep moving.",
  },
  {
    slug: "food-brand",
    title: "Centralized Operations Rollout — QSR Brand",
    challenge:
      "Most food brands grow store by store, and each new branch ends up doing things a little differently — even if it started out copying the first one. Before long, no two stores run exactly the same way. This brand wanted to avoid that from the very beginning, before opening a second location.",
    solutionIntro:
      "PulseLogica set up one shared operating system before the brand started expanding:",
    solution: [
      "One point-of-sale and one staff app used across every store, not a different setup per branch",
      "Inventory and sales reporting built centrally, so every store feeds the same system",
      "New store managers trained on one standard setup, not their own version of it",
    ],
    infrastructure: [
      "One shared point-of-sale and staff management system across all locations",
      "The same operating steps at every store",
      "Per-store profit visibility built in from day one, not added later",
    ],
    impact:
      "The brand avoids the headaches that usually show up later — retraining staff who transfer between branches, untangling stores that quietly grew apart, paying for different tools at each location — because every store was built to run the same way from the start.",
  },
];
