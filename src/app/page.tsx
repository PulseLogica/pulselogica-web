import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Phases from "@/components/Phases";
import CaseStudies from "@/components/CaseStudies";
import Proof from "@/components/Proof";
import CTAFooter from "@/components/CTAFooter";
import MobileStickyCta from "@/components/MobileStickyCta";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";

export default function Home() {
  return (
    <main>
      <ScrollReveal />
      <Nav />
      <Hero />
      <TrustStrip />
      <Phases />
      <CaseStudies />
      <Proof />
      <CTAFooter />
      <MobileStickyCta />
      <BackToTop />
    </main>
  );
}
