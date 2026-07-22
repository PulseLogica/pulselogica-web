type CaseStudy = {
  title: string;
  challenge: string;
  solutionIntro: string;
  solution: string[];
  infrastructure: string[];
  impact: string;
};

const cases: CaseStudy[] = [
  {
    title: "CADCC Operational Continuity System",
    challenge:
      "CAD Construction Corporation ran the way most project-based SMEs do — through the owner's memory, relationships, and hands-on presence. Job handoffs lived in group chats, not documents. A management layer had been tried once and quietly reverted, and output visibly dropped whenever the owner was unavailable.",
    solutionIntro:
      "PulseLogica ran a full operational diagnostic and systemized CADCC's core workflow before introducing any tooling:",
    solution: [
      "Quote-to-close-out process mapping",
      "Champion identification for each operational step",
      "Documentation of previously undocumented judgment calls (bid pricing, crew sourcing, compliance sign-off)",
      "Sequenced tooling layered on only after the process was proven on paper",
    ],
    infrastructure: [
      "Documented quote → execution → close-out workflow",
      "Named process owners independent of the founder",
      "Repeatable, written procedures for previously tribal-knowledge decisions",
    ],
    impact:
      "CADCC now runs day-to-day operations without the owner physically present for every decision — the business became legible enough for someone other than the founder to run it.",
  },
  {
    title: "Featherweight Chicken Centralized Operations Rollout",
    challenge:
      'Most QSR brands scale by trial and error — each new store copies most, but not all, of how the first one operates, and "how we do things" quietly forks with every location added. FWT needed to avoid that drift before it opened beyond its first store.',
    solutionIntro:
      "PulseLogica centralized FWT's operating stack once, before multi-location growth began:",
    solution: [
      "Unified POS and team app deployed as the single system of record",
      "Inventory and reporting logic built centrally, not per-store",
      "Manager onboarding designed around one standard system, not location-specific variants",
    ],
    infrastructure: [
      "Centralized POS and team management system (FWT POS, FWTeam App)",
      "Standardized store-to-store operating procedures",
      "Built-in per-location margin visibility from day one",
    ],
    impact:
      "FWT avoids the reconciliation, retraining, and duplicate-tooling costs that typically surface once a growing brand discovers its stores have quietly diverged — because the system was designed the same everywhere from the start.",
  },
];

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="annot mb-3" style={{ color: "#FF7A00" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0"></span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function CaseStudies() {
  return (
    <section id="cases" className="py-28 px-6 border-t border-white/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <span className="annot">Proof in the field</span>
          <h2 className="mt-5 text-4xl md:text-5xl font-light tracking-tight">
            Two systems, built and running.
          </h2>
        </div>

        <div className="space-y-8">
          {cases.map((c) => (
            <div key={c.title} className="card-dark rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-semibold leading-tight">{c.title}</h3>

              <Subsection label="Challenge">
                <p className="text-slate-400 leading-relaxed">{c.challenge}</p>
              </Subsection>

              <Subsection label="Solution">
                <p className="text-slate-400 leading-relaxed mb-4">{c.solutionIntro}</p>
                <BulletList items={c.solution} />
              </Subsection>

              <Subsection label="Infrastructure Delivered">
                <BulletList items={c.infrastructure} />
              </Subsection>

              <Subsection label="Impact">
                <p className="text-slate-400 leading-relaxed">{c.impact}</p>
              </Subsection>

              <a
                href="#"
                className="mt-8 inline-block text-sm font-medium"
                style={{ color: "#FF7A00" }}
              >
                Read the full case study →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
