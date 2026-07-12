import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Services from "@/components/Services";
import Process from "@/components/Process";
import CaseStudies from "@/components/CaseStudies";
import Values from "@/components/Values";
import CTAFooter from "@/components/CTAFooter";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Services />
      <Process />
      <CaseStudies />
      <Values />
      <CTAFooter />
    </main>
  );
}
