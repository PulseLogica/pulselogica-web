import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import CaseStudyDetail from "@/components/CaseStudyDetail";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { caseStudies, getCaseStudy } from "@/data/case-studies";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getCaseStudy(slug);

  if (!data) {
    notFound();
  }

  return (
    <main>
      <ScrollReveal />
      <Nav />
      <CaseStudyDetail data={data} />
      <Footer />
      <BackToTop />
    </main>
  );
}
