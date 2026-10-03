import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data protection & privacy — CoralStones",
  description: "How CoralStones collects, stores and protects your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-10 last:border-0">
      <h2 className="font-serif text-xl font-semibold text-primary">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

export default function DataProtectionPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-14 text-center">
        <p className="eyebrow text-white/60">Privacy</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white">Data protection</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-white/65">
          Your privacy matters. We collect only what we need, store it securely, and never sell it.
        </p>
        <p className="mt-4 text-xs text-white/40">Last updated: January 2026</p>
      </section>

      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl space-y-10">

          <Section title="Geographic scope">
            <p>
              CoralStones is operated from Kenya and directed exclusively at users in Kenya and East Africa.
              This platform is <strong className="text-primary">not directed at residents of the European Union or European Economic Area</strong>.
              If you are located in the EU or EEA, please do not use this service.
              The EU General Data Protection Regulation (GDPR) does not apply to our operations.
            </p>
            <p>
              Our data practices are governed by the <strong className="text-primary">Kenya Data Protection Act 2019</strong> and
              the regulatory oversight of the Office of the Data Protection Commissioner (Kenya).
            </p>
          </Section>

          <Section title="Who we are">
            <p>
              CoralStones Properties Listings Limited is the data controller for all personal data collected
              through this platform. We are registered in Kenya. Our Data Protection Officer can be reached at{" "}
              <a href="mailto:privacy@coralstonesproperties.co.ke" className="text-accent hover:brightness-90">privacy@coralstonesproperties.co.ke</a>.
            </p>
          </Section>

          <Section title="What data we collect">
            <p><strong className="text-primary">Account data:</strong> Name, email address, phone number and country when you register or list a property.</p>
            <p><strong className="text-primary">Search and browsing data:</strong> Properties you view, save and compare. Search terms and filter preferences. This helps us show you more relevant results.</p>
            <p><strong className="text-primary">Enquiry data:</strong> Messages sent to agents through the platform. These are stored so both parties can refer to previous correspondence.</p>
            <p><strong className="text-primary">Verification data:</strong> For agents and listers, we collect ID documents, licence numbers and business registration certificates. These are stored securely and not visible to buyers.</p>
            <p><strong className="text-primary">Device and usage data:</strong> IP address, browser type, device type and pages visited — collected automatically by our servers. Used for security and to improve the platform.</p>
          </Section>

          <Section title="How we use your data">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>To facilitate property searches, enquiries and bookings</li>
              <li>To verify agents, listings and title deeds</li>
              <li>To send transactional emails (listing confirmations, enquiry notifications)</li>
              <li>To detect and prevent fraud on the platform</li>
              <li>To improve search relevance and platform features</li>
              <li>To comply with legal obligations in the countries we operate in</li>
            </ul>
            <p>We do <strong className="text-primary">not</strong> sell your data to third parties. We do <strong className="text-primary">not</strong> use your data for advertising outside the platform.</p>
          </Section>

          <Section title="Legal basis for processing">
            <p>We process your data under the following legal bases:</p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li><strong className="text-primary">Contractual necessity:</strong> To provide the service you signed up for</li>
              <li><strong className="text-primary">Legitimate interests:</strong> Fraud prevention, platform security, service improvement</li>
              <li><strong className="text-primary">Legal obligation:</strong> Anti-money laundering, tax and regulatory compliance</li>
              <li><strong className="text-primary">Consent:</strong> Marketing emails (you can withdraw at any time)</li>
            </ul>
          </Section>

          <Section title="Data retention">
            <p>Account data is retained for as long as your account is active, plus 7 years thereafter for legal compliance.</p>
            <p>Enquiry messages are retained for 2 years. Verification documents are retained for 5 years.</p>
            <p>Browsing and search logs are anonymised after 90 days.</p>
          </Section>

          <Section title="Your rights">
            <p>Under the Kenya Data Protection Act 2019, you have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li><strong className="text-primary">Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-primary">Rectification</strong> — correct inaccurate data</li>
              <li><strong className="text-primary">Erasure</strong> — request deletion of your data (subject to legal retention requirements)</li>
              <li><strong className="text-primary">Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong className="text-primary">Objection</strong> — object to processing based on legitimate interests</li>
              <li><strong className="text-primary">Restriction</strong> — limit how we use your data while a dispute is resolved</li>
            </ul>
            <p>To exercise any right, email <a href="mailto:privacy@coralstonesproperties.co.ke" className="text-accent hover:brightness-90">privacy@coralstonesproperties.co.ke</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="Cookies">
            <p>We use strictly necessary cookies (session management, security) and analytics cookies (to understand how the platform is used). We do not use advertising cookies.</p>
            <p>You can disable analytics cookies in your browser settings. Disabling strictly necessary cookies will affect platform functionality.</p>
          </Section>

          <Section title="Third-party services">
            <p>We use a limited number of trusted third-party services including our cloud hosting provider, payment processor and email delivery service. Each is contractually required to protect your data and may not use it for their own purposes.</p>
          </Section>

          <Section title="Security">
            <p>All data is encrypted in transit (TLS 1.3) and at rest. Verification documents are stored in an isolated, access-controlled environment. Our team undergoes annual data protection training.</p>
          </Section>

          <Section title="Contact">
            <p>
              For privacy questions or to exercise your rights:{" "}
              <a href="mailto:privacy@coralstonesproperties.co.ke" className="text-accent hover:brightness-90">privacy@coralstonesproperties.co.ke</a>
            </p>
            <p>
              To complain about how we handle your data, you may contact the{" "}
              <a href="https://www.odpc.go.ke" className="text-accent hover:brightness-90" target="_blank" rel="noopener noreferrer">
                Office of the Data Protection Commissioner (Kenya)
              </a>.
            </p>
          </Section>
        </div>
      </section>
    </>
  );
}
