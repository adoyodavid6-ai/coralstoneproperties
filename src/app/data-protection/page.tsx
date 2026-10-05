import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/layout/CookieSettings";
import { LEGAL, LEGAL_ADDRESS_ONELINE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Data protection & privacy — CoralStones",
  description: "How CoralStones collects, stores and protects your personal data.",
};

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 border-b border-line pb-10 last:border-0">
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

          <Section title="Geographic scope &amp; GDPR">
            <p>
              CoralStones is operated from Kenya and our services are <strong className="text-primary">primarily directed at
              users in Kenya and East Africa</strong>. Our data practices are governed by the{" "}
              <strong className="text-primary">Kenya Data Protection Act 2019</strong> and the oversight of the Office of the
              Data Protection Commissioner (Kenya).
            </p>
            <p>
              We know many of our users are part of the East African diaspora. If you access the platform from the
              European Union, the EEA or the UK, the EU/UK <strong className="text-primary">General Data Protection
              Regulation (GDPR)</strong> may apply to the processing of your personal data. Where it does, we will:
            </p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li>process your data only on the legal bases set out below;</li>
              <li>honour your GDPR rights (access, rectification, erasure, portability, objection, restriction) — the same rights we extend under the Kenya DPA;</li>
              <li>act as the data controller, reachable through our Data Protection Officer (below).</li>
            </ul>
            <p>
              We do not currently have an EU/UK-established entity or representative. If you would prefer we did not
              process your data, please do not submit it, or contact our DPO to have it removed.
            </p>
          </Section>

          <Section title="Who we are">
            <p>
              {LEGAL.entity} is the data controller for all personal data collected through this platform.
              We are registered in {LEGAL.address.country}.
            </p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li><strong className="text-primary">Company registration no.:</strong> {LEGAL.registrationNumber}</li>
              <li><strong className="text-primary">ODPC data-controller registration no.:</strong> {LEGAL.odpcRegistrationNumber}</li>
              <li><strong className="text-primary">Registered office:</strong> {LEGAL_ADDRESS_ONELINE}</li>
            </ul>
            <p>
              Our Data Protection Officer can be reached at{" "}
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

          <Section title="Cookies" id="cookies">
            <p>We use strictly necessary cookies to run the site and optional analytics cookies to understand how the platform is used. Analytics only load after you accept them in the cookie banner. We do not use advertising cookies.</p>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
                    <th className="py-2 pr-4 font-semibold">Cookie / storage</th>
                    <th className="py-2 pr-4 font-semibold">Purpose</th>
                    <th className="py-2 pr-4 font-semibold">Retention</th>
                    <th className="py-2 font-semibold">Provider</th>
                  </tr>
                </thead>
                <tbody className="text-ink-soft">
                  <tr className="border-b border-line/60">
                    <td className="py-2 pr-4">Consent preference</td>
                    <td className="py-2 pr-4">Remembers your cookie choice</td>
                    <td className="py-2 pr-4">Until you clear it</td>
                    <td className="py-2">CoralStones (essential)</td>
                  </tr>
                  <tr className="border-b border-line/60">
                    <td className="py-2 pr-4">Saved / compared listings</td>
                    <td className="py-2 pr-4">Keeps your saved and compared properties on this device</td>
                    <td className="py-2 pr-4">Until you clear it</td>
                    <td className="py-2">CoralStones (essential)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Analytics</td>
                    <td className="py-2 pr-4">Anonymous usage measurement (page views, performance)</td>
                    <td className="py-2 pr-4">Up to 24 months</td>
                    <td className="py-2">Vercel Analytics (optional)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="pt-2"><strong className="text-primary">Withdraw or change consent:</strong> use the button below to reopen the cookie banner and accept or decline analytics at any time. You can also clear cookies/site data in your browser. Disabling strictly necessary cookies will affect platform functionality.</p>
            <div className="pt-1">
              <CookieSettingsButton />
            </div>
          </Section>

          <Section title="Third-party services">
            <p>We use a limited number of trusted third-party processors, each contractually required to protect your data and not use it for their own purposes:</p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li><strong className="text-primary">Vercel</strong> — hosting and anonymous analytics</li>
              <li><strong className="text-primary">Supabase</strong> — database and storage</li>
              <li><strong className="text-primary">Resend</strong> — transactional and subscriber email delivery</li>
              <li><strong className="text-primary">Flutterwave</strong> — payment processing (only when you make a payment)</li>
            </ul>
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
