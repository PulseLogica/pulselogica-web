import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import BulletList from "@/components/ui/BulletList";

export const metadata: Metadata = {
  title: "Terms and Conditions — PulseLogica",
  description:
    "The terms and conditions governing your use of the PulseLogica website and its consultation booking features.",
};

export default function TermsAndConditionsPage() {
  return (
    <main>
      <ScrollReveal />
      <Nav />
      <LegalPageLayout title="PulseLogica Terms and Conditions" lastUpdated="July 24, 2026">
        <p className="text-slate-400 leading-relaxed">
          Welcome to PulseLogica. By accessing or using our website
          (https://www.pulselogica.com/), you agree to comply with and be bound by the following
          Terms and Conditions. Please read them carefully.
        </p>

        <LegalSection heading="1. Acceptance of Terms">
          <p>
            By visiting this Website or booking a call with our team, you confirm that you have
            read, understood, and agreed to these Terms and Conditions. If you do not agree with
            any part of these terms, please discontinue use of the Website.
          </p>
        </LegalSection>

        <LegalSection heading="2. Website Use and Services">
          <BulletList
            items={[
              <>
                <strong className="text-white">Purpose:</strong> This Website serves as an
                informational platform introducing PulseLogica&rsquo;s operator-led systemization
                and legacy transition services. It also enables visitors to schedule initial
                consultation calls via our &ldquo;Book a Call&rdquo; functionality.
              </>,
              <>
                <strong className="text-white">Permitted Use:</strong> You agree to use this site
                strictly for lawful purposes. You must not misuse forms, attempt unauthorized
                access, or disrupt site security or performance.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="3. Intellectual Property Rights">
          <p>
            All content published on this Website — including logos, copy, designs, graphics, and
            underlying operational frameworks — is the exclusive intellectual property of
            PulseLogica or its licensors and is protected under Philippine copyright and
            intellectual property laws.
          </p>
          <p>
            You may not reproduce, distribute, or modify any content from this site without prior
            written permission from PulseLogica.
          </p>
        </LegalSection>

        <LegalSection heading="4. Consultations and Bookings">
          <BulletList
            items={[
              "Submitting your email or booking a call through the Website does not automatically establish a formal commercial contract or service agreement.",
              "Formal engagements, operational blueprints, and service scope are governed separately by dedicated client agreements executed directly between PulseLogica and the client.",
            ]}
          />
        </LegalSection>

        <LegalSection heading="5. Disclaimer of Warranties & Limitation of Liability">
          <BulletList
            items={[
              <>
                <strong className="text-white">&ldquo;As-Is&rdquo; Basis:</strong> The Website and
                its contents are provided on an &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; basis without warranties of any kind. While we strive for
                accuracy, PulseLogica does not warrant that site functions will be uninterrupted
                or error-free.
              </>,
              <>
                <strong className="text-white">Limitation:</strong> To the maximum extent
                permitted under Philippine law, PulseLogica shall not be liable for any direct,
                indirect, incidental, or consequential damages resulting from your use of or
                inability to use this Website.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="6. Privacy and Data Handling">
          <p>
            Your privacy is vital to us. Any personal information submitted through the Website is
            handled according to our{" "}
            <a href="/privacy-policy" className="hover:text-white transition underline">
              Privacy Policy
            </a>{" "}
            and the Philippine Data Privacy Act of 2012.
          </p>
        </LegalSection>

        <LegalSection heading="7. Governing Law and Dispute Resolution">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the
            Republic of the Philippines. Any dispute or legal claim arising out of or related to
            the use of this Website shall fall under the exclusive jurisdiction of the competent
            courts of the Philippines.
          </p>
        </LegalSection>

        <LegalSection heading="8. Updates to These Terms">
          <p>
            PulseLogica reserves the right to revise or replace these Terms at any time. Updated
            versions will be posted on this page with a revised &ldquo;Last Updated&rdquo; date.
            Continued use of the Website after updates indicates your acceptance of the revised
            Terms.
          </p>
        </LegalSection>

        <LegalSection heading="9. Contact Us">
          <p>For questions regarding these Terms and Conditions, please reach out to:</p>
          <p>
            <strong className="text-white">Entity:</strong> PulseLogica
            <br />
            <strong className="text-white">Email:</strong>{" "}
            <a href="mailto:kevin@pulselogica.com" className="hover:text-white transition">
              kevin@pulselogica.com
            </a>
            <br />
            <strong className="text-white">Website:</strong> https://www.pulselogica.com/
          </p>
        </LegalSection>
      </LegalPageLayout>
      <Footer />
      <BackToTop />
    </main>
  );
}
