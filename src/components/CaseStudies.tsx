import Link from "next/link";
import BulletList from "@/components/ui/BulletList";

type CaseStudy = {
  slug: string;
  title: string;
  challenge: string;
  solutionIntro: string;
  solution: string[];
  infrastructure: string[];
  impact: string;
};

const cases: CaseStudy[] = [
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

              <Link
                href={`/case-studies/${c.slug}`}
                className="mt-8 inline-block text-sm font-medium"
                style={{ color: "#FF7A00" }}
              >
                Read the full case study →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
