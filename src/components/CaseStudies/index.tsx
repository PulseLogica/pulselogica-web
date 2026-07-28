import Link from "next/link";
import BulletList from "@/components/ui/BulletList";
import { cases } from "./constants";

function Subsection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="annot mb-3" style={{ color: "var(--color-amber)" }}>
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
                style={{ color: "var(--color-amber)" }}
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
