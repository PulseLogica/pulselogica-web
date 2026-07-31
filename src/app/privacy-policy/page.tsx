import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import LegalPageLayout, { LegalSection } from "@/components/LegalPageLayout";
import BulletList from "@/components/ui/BulletList";

export const metadata: Metadata = {
  title: "Privacy Policy — PulseLogica",
  description:
    "How PulseLogica collects, processes, stores, and protects your personal information, in compliance with the Philippine Data Privacy Act of 2012.",
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <ScrollReveal />
      <Nav />
      <LegalPageLayout title="PulseLogica Website Privacy Policy" lastUpdated="July 24, 2026">
        <p className="text-slate-400 leading-relaxed">
          At PulseLogica (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we believe
          that simple, practical operations begin with complete transparency and respect for your
          data privacy. This Privacy Policy outlines how we collect, process, store, and protect
          your personal information when you visit our website (https://www.pulselogica.com/) or
          use features such as our &ldquo;Book a Call&rdquo; function.
        </p>
        <p className="text-slate-400 leading-relaxed">
          As a Personal Information Controller (PIC), PulseLogica handles all personal data in
          strict compliance with the Data Privacy Act of 2012 (Republic Act No. 10173), its
          Implementing Rules and Regulations (IRR), and NPC Circular No. 2023-04 on Consent and
          Privacy Notices.
        </p>

        <LegalSection heading="1. What Information We Collect">
          <p>
            We only collect personal information that is necessary and directly relevant to
            providing you with practical operational advice or responding to your inquiries.
          </p>
          <div>
            <p className="text-white font-medium mb-2">Information You Provide Directly:</p>
            <BulletList
              items={[
                <>
                  <strong className="text-white">Email Address:</strong> Collected when you
                  submit a request through our &ldquo;Book a Call&rdquo; form.
                </>,
                <>
                  <strong className="text-white">Name, Phone Number, &amp; Business Details:</strong>{" "}
                  Collected if provided voluntarily during call bookings or email communication.
                </>,
              ]}
            />
          </div>
          <div>
            <p className="text-white font-medium mb-2">Automated Site Information (Technical Data):</p>
            <BulletList
              items={[
                "Basic log data such as IP address, browser type, and page usage analytics to ensure security, stability, and proper site functionality.",
              ]}
            />
          </div>
        </LegalSection>

        <LegalSection heading="2. Legal Basis and How We Use Your Information">
          <p>
            We process your data adhering strictly to the core principles of Transparency,
            Legitimate Purpose, and Proportionality.
          </p>
          <p>We use your personal data for the following specific purposes:</p>
          <BulletList
            items={[
              <>
                <strong className="text-white">Consultation Scheduling:</strong> To contact you
                and arrange consultations booked through our landing page.
              </>,
              <>
                <strong className="text-white">Direct Communication:</strong> To answer your
                questions regarding our operator-led transition services and system designs.
              </>,
              <>
                <strong className="text-white">System Operations &amp; Security:</strong> To
                maintain the technical integrity, safety, and operational performance of our
                website.
              </>,
            ]}
          />
          <p className="italic">
            We do not sell, rent, or trade your personal information to third parties for
            commercial or marketing purposes.
          </p>
        </LegalSection>

        <LegalSection heading="3. Data Storage, Security, and Retention">
          <BulletList
            items={[
              <>
                <strong className="text-white">Storage &amp; Protection:</strong> We implement
                strict physical, organizational, and technical security measures — including
                encrypted channels and access controls — to protect your personal data from
                unauthorized access, disclosure, alteration, or destruction.
              </>,
              <>
                <strong className="text-white">Retention:</strong> We keep your email address and
                associated details only for as long as necessary to fulfill the purpose for which
                it was collected (e.g., managing client communications or scheduling calls) or as
                required by applicable Philippine laws. Once the purpose is complete, your data is
                securely deleted or anonymized.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="4. Data Sharing and Third-Party Service Providers">
          <p>PulseLogica does not share your data except when necessary for site operations:</p>
          <BulletList
            items={[
              <>
                <strong className="text-white">Service Providers:</strong> We may work with
                trusted infrastructure partners (e.g., scheduling platforms, secure cloud hosting)
                who process data strictly under our instructions and in compliance with the Data
                Privacy Act of 2012.
              </>,
              <>
                <strong className="text-white">Legal Requirements:</strong> We may disclose
                information if required by law, legal process, or orders from competent Philippine
                authorities.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="5. Your Rights as a Data Subject">
          <p>
            Under Section 16 of the Data Privacy Act of 2012, you hold specific rights regarding
            your personal data:
          </p>
          <ol className="space-y-2 text-sm list-decimal list-inside">
            <li>
              <strong className="text-white">Right to be Informed:</strong> The right to know how
              your data is collected and processed.
            </li>
            <li>
              <strong className="text-white">Right to Access:</strong> The right to request copies
              of the personal data we hold about you.
            </li>
            <li>
              <strong className="text-white">Right to Object:</strong> The right to withhold or
              withdraw consent to data processing.
            </li>
            <li>
              <strong className="text-white">Right to Erasure or Blocking:</strong> The right to
              request the deletion or removal of your personal information.
            </li>
            <li>
              <strong className="text-white">Right to Rectification:</strong> The right to correct
              inaccurate or outdated information.
            </li>
            <li>
              <strong className="text-white">Right to Damages:</strong> The right to be indemnified
              for damages due to inaccurate, incomplete, or unauthorized use of personal data.
            </li>
          </ol>
        </LegalSection>

        <LegalSection heading="6. Contact Us & Data Privacy Officer (DPO)">
          <p>
            If you have questions, concerns, or wish to exercise your rights as a data subject,
            please contact us directly:
          </p>
          <p>
            <strong className="text-white">Entity:</strong> PulseLogica
            <br />
            <strong className="text-white">Email:</strong>{" "}
            <a href="mailto:contact@pulselogica.com" className="hover:text-white transition">
              contact@pulselogica.com
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
