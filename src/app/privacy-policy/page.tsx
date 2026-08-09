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
                "Basic log data such as IP address, browser type, and page usage analytics to ensure security, stability, and proper site functionality. Where analytics or similar tracking tools use cookies, you will be presented with a cookie notice on your first visit, allowing you to accept or decline non-essential cookies.",
              ]}
            />
          </div>
        </LegalSection>

        <LegalSection heading="2. Legal Basis and How We Use Your Information">
          <p>
            We process your data adhering strictly to the core principles of Transparency,
            Legitimate Purpose, and Proportionality.
          </p>
          <p>
            <strong className="text-white">Legal basis for processing.</strong> We process your
            personal data on the basis of your consent, given when you voluntarily submit a form on
            this Website (e.g., the &ldquo;Book a Call&rdquo; form), and, where applicable, because
            processing is necessary to take steps at your request prior to entering into a service
            engagement with us.
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
            ]}
          />
          <p>
            <strong className="text-white">Retention:</strong> We retain personal data collected
            through this Website only for as long as necessary to fulfill the purpose for which it
            was collected:
          </p>
          <BulletList
            items={[
              <>
                Discovery Call and booking inquiries that do not convert into a client engagement:
                retained for up to twelve (12) months from last contact, then securely deleted or
                anonymized.
              </>,
              <>
                Information tied to an active or completed client engagement: retained per the
                retention terms of the applicable client agreement, or as required by Philippine law
                (e.g., tax and accounting record-keeping requirements), whichever is longer.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="4. Data Sharing and Third-Party Service Providers">
          <p>PulseLogica does not share your data except when necessary for site operations:</p>
          <BulletList
            items={[
              <>
                <strong className="text-white">Service Providers:</strong> We work with trusted
                infrastructure and productivity partners — including scheduling, workspace,
                communication, and cloud hosting providers — who process data strictly under our
                instructions and in compliance with the Data Privacy Act of 2012.
              </>,
              <>
                <strong className="text-white">Cross-Border Data Transfers:</strong> Some of our
                service providers process or store data on servers located outside the Philippines.
                Where this occurs, we take reasonable steps to ensure such providers maintain a
                comparable standard of data protection, consistent with Section 21 of the DPA&rsquo;s
                Implementing Rules and Regulations.
              </>,
              <>
                <strong className="text-white">Legal Requirements:</strong> We may disclose
                information if required by law, legal process, or orders from competent Philippine
                authorities.
              </>,
            ]}
          />
        </LegalSection>

        <LegalSection heading="5. Data Breach Notification">
          <p>
            In the event of a personal data breach that poses a real risk of serious harm to
            affected individuals, PulseLogica will notify the National Privacy Commission and
            affected data subjects within seventy-two (72) hours of discovering the breach, in
            accordance with Section 20(f) of the Data Privacy Act and its Implementing Rules and
            Regulations.
          </p>
        </LegalSection>

        <LegalSection heading="6. Your Rights as a Data Subject">
          <p>
            Under Sections 16 and 18 of the Data Privacy Act of 2012, you hold the following rights
            regarding your personal data:
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
              <strong className="text-white">Right to Data Portability:</strong> The right to obtain
              a copy of your data in an electronic or structured format, where technically feasible.
            </li>
            <li>
              <strong className="text-white">Right to Damages:</strong> The right to be indemnified
              for damages due to inaccurate, incomplete, or unauthorized use of personal data.
            </li>
          </ol>
          <p>
            To exercise any of these rights, contact our Data Protection Officer using the details
            in Section 7 below.
          </p>
        </LegalSection>

        <LegalSection heading="7. Contact Us & Data Protection Officer (DPO)">
          <p>
            If you have questions, concerns, or wish to exercise your rights as a data subject,
            please contact us directly:
          </p>
          <p>
            <strong className="text-white">Entity:</strong> PulseLogica
            <br />
            <strong className="text-white">Data Protection Officer:</strong> John Christopher Azcarraga
            <br />
            <strong className="text-white">Email:</strong>{" "}
            <a href="mailto:kevin@pulselogica.com" className="hover:text-white transition">
              kevin@pulselogica.com
            </a>
            <br />
            <strong className="text-white">Website:</strong> https://www.pulselogica.com/
          </p>
        </LegalSection>

        <LegalSection heading="8. NPC Registration Status">
          <p>
            PulseLogica&rsquo;s current data processing activities fall below the National Privacy
            Commission&rsquo;s mandatory registration thresholds under NPC Circular No. 2022-04. In
            accordance with Track 3 of the Circular, PulseLogica has filed a Sworn Declaration and
            Undertaking for Exemption from Registration with the NPC.
          </p>
        </LegalSection>
      </LegalPageLayout>
      <Footer />
      <BackToTop />
    </main>
  );
}
