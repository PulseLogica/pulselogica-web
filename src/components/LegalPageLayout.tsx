import Link from "next/link";

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <header className="pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="annot inline-block mb-8 hover:text-white transition">
          ← Back home
        </Link>

        <span className="annot block mb-4" style={{ color: "var(--color-amber)" }}>
          Legal
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight">{title}</h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: {lastUpdated}</p>

        <div className="mt-14 space-y-4">{children}</div>
      </div>
    </header>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-8 mt-8 border-t border-white/10 first:pt-0 first:mt-0 first:border-t-0">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">{heading}</h2>
      <div className="space-y-4 text-slate-400 leading-relaxed">{children}</div>
    </section>
  );
}
