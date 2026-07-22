import Link from "next/link";
import BulletList from "@/components/ui/BulletList";
import { GOOGLE_CALENDAR_STRATEGY_SESSION } from "@/lib/constants";
import type { CaseStudyDetail as CaseStudyDetailData } from "@/data/case-studies";

export default function CaseStudyDetail({ data }: { data: CaseStudyDetailData }) {
  return (
    <>
      <header className="pt-28 pb-16 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href="/#cases"
            className="annot inline-block mb-8 hover:text-white transition"
          >
            ← Back to case studies
          </Link>

          <span className="annot block mb-4" style={{ color: "#FF7A00" }}>
            Case Study
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1]">
            {data.title}
          </h1>
          <p className="mt-7 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            {data.dek}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-10 sm:gap-16">
            <div>
              <div className="annot mb-2">Client</div>
              <div className="text-white font-medium">{data.client}</div>
            </div>
            <div>
              <div className="annot mb-2">Engagement</div>
              <div className="text-white font-medium">{data.engagement}</div>
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <span className="annot">The Challenge</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light tracking-tight">
            {data.challengeHeading}
          </h2>
          <p className="mt-6 text-slate-400 leading-relaxed">{data.challengeBody}</p>

          <div className="mt-10 card-dark rounded-2xl p-8">
            <div className="annot mb-4" style={{ color: "#FF7A00" }}>
              {data.findingsLabel}
            </div>
            <BulletList items={data.findings} />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <span className="annot">The Approach</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-light tracking-tight">
            {data.approachHeading}
          </h2>

          <div className="mt-10 space-y-8">
            {data.phases.map((phase) => (
              <div key={phase.label}>
                <div className="annot mb-3" style={{ color: "#FF7A00" }}>
                  {phase.label}
                </div>
                <p className="text-slate-400 leading-relaxed">{phase.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 card-dark rounded-2xl p-8">
            <div className="annot mb-4" style={{ color: "#FF7A00" }}>
              Key Milestones Delivered
            </div>
            <BulletList items={data.milestones} />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <span className="annot">{data.stackHeading}</span>
          <p className="mt-4 text-slate-400 leading-relaxed">{data.stackIntro}</p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {data.stack.map((item) => (
              <div key={item.name} className="card-dark rounded-2xl p-6">
                <div className="text-white font-semibold mb-2">{item.name}</div>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <span className="annot">{data.beforeAfterHeading}</span>

          <div className="mt-10 card-dark rounded-2xl p-8 space-y-5">
            {data.beforeAfter.map((row, i) => (
              <div key={row.label}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                  <span className="text-white font-medium">{row.label}</span>
                  <span className="text-slate-400">
                    {row.before}
                    <span className="mx-2 text-slate-600">→</span>
                    <span style={{ color: "#FF7A00" }}>{row.after}</span>
                  </span>
                </div>
                {i < data.beforeAfter.length - 1 && (
                  <div className="h-px bg-white/10 mt-5"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="annot">Ready to Build?</span>
          <h2 className="mt-5 text-3xl md:text-4xl font-light tracking-tight leading-tight">
            {data.ctaHeading}
          </h2>
          <p className="mt-6 text-slate-400 leading-relaxed">{data.ctaBody}</p>

          <a
            href={GOOGLE_CALENDAR_STRATEGY_SESSION}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block btn-primary text-black font-semibold text-[15px] px-10 py-4 rounded-lg"
          >
            Start the Conversation
          </a>
        </div>
      </section>
    </>
  );
}
