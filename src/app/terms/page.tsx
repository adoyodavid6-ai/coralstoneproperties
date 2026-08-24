import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of service & privacy — CoralStone",
  description: "CoralStone's terms of service, privacy policy and acceptable use rules.",
};

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="border-b border-line pb-10 last:border-0">
      <h2 className="font-serif text-xl font-semibold text-primary">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-14 text-center">
        <p className="eyebrow text-white/60">Legal</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white">Terms &amp; privacy</h1>
        <p className="mx-auto mt-4 max-w-md text-white/65">
          By using CoralStone Properties Listings, you agree to these terms.
          They are written in plain language — not legalese.
        </p>
        <p className="mt-4 text-xs text-white/40">Effective date: 1 January 2026</p>
      </section>

      {/* Quick nav */}
      <div className="border-b border-line bg-surface-raised">
        <div className="container-page flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm">
          {[
            ["#using", "Using the platform"],
            ["#listings", "Listings & agents"],
            ["#payments", "Payments & fees"],
            ["#liability", "Liability"],
            ["#privacy", "Privacy summary"],
            ["#cookies", "Cookies"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-accent hover:brightness-90">{label}</a>
          ))}
        </div>
      </div>

      <section className="container-page py-14">
        <div className="mx-auto max-w-2xl space-y-10">

          <Section id="using" title="1. Using the platform">
            <p>CoralStone Properties Listings (&quot;CoralStone&quot;, &quot;we&quot;, &quot;us&quot;) is a property marketplace operating in Kenya, Uganda, Tanzania and Rwanda. We connect buyers, tenants and investors with verified agents and property owners.</p>
            <p>You must be at least 18 years old to use the platform. By registering or making an enquiry, you confirm you are acting in your own right or with proper authority on behalf of another person.</p>
            <p>You agree not to use the platform to post fraudulent listings, impersonate agents, scrape data, or engage in any activity that harms other users or the integrity of the platform.</p>
          </Section>

          <Section id="listings" title="2. Listings and agents">
            <p>All listings on CoralStone are provided by licensed agents or property owners. We verify listings before publication, but we do not guarantee the accuracy of every detail — especially for information that can change (price, availability).</p>
            <p>CoralStone is not a party to any property transaction. We facilitate the connection between buyer and agent; the contract is between those two parties.</p>
            <p>Agents are responsible for ensuring their listings are accurate and that they have proper authority to list the property. Misrepresentation is grounds for immediate removal and permanent ban.</p>
            <p>Buyers should conduct their own due diligence, including a title search, before proceeding to any transaction. CoralStone&apos;s verification reduces — but does not eliminate — risk.</p>
          </Section>

          <Section id="payments" title="3. Payments and fees">
            <p>Listing on CoralStone is free. Agents may pay for Featured or Spotlight promotion, verification services and subscription plans. These fees are non-refundable once the service has been activated.</p>
            <p>CoralStone earns a platform fee on transactions completed through the platform. This fee is disclosed at the time of reservation and is paid by the agent or seller, not the buyer.</p>
            <p>CoralStone does not hold buyer funds. Any deposit or purchase payment is made directly to the agent or seller and is governed by the sale or tenancy agreement between the parties.</p>
            <p>Never pay a deposit in cash or to a personal mobile money number. CoralStone will never ask you to pay us directly for a property you are buying or renting.</p>
          </Section>

          <Section id="liability" title="4. Liability">
            <p>CoralStone provides the platform &quot;as is&quot;. To the fullest extent permitted by law, we are not liable for losses arising from property transactions, agent conduct, inaccurate listings or fraud by third parties.</p>
            <p>Our verification services reduce risk but are not a guarantee of title or property condition. Buyers should obtain independent legal advice before completing any property transaction.</p>
            <p>In any event, our liability is limited to the fees you have paid to CoralStone in the 12 months preceding the event giving rise to the claim.</p>
          </Section>

          <Section id="privacy" title="5. Privacy summary">
            <p>We collect your name, email and phone number to facilitate enquiries and listings. We collect browsing data to improve search relevance. We do not sell your data.</p>
            <p>
              For the full privacy policy, see our{" "}
              <Link href="/data-protection" className="text-accent hover:brightness-90">Data protection page</Link>.
            </p>
          </Section>

          <Section id="cookies" title="6. Cookies">
            <p>We use strictly necessary cookies (session, security) and optional analytics cookies. We do not use advertising cookies. You can manage cookie preferences in your browser settings.</p>
          </Section>

          <Section title="7. Governing law">
            <p>These terms are governed by the laws of Kenya. Disputes are subject to the exclusive jurisdiction of the Kenyan courts, unless required otherwise by local law in the country where you are based.</p>
          </Section>

          <Section title="8. Changes to these terms">
            <p>We may update these terms. We will notify registered users by email at least 14 days before material changes take effect. Continued use of the platform after that date constitutes acceptance.</p>
            <p>Questions? <Link href="/contact" className="text-accent hover:brightness-90">Contact us</Link>.</p>
          </Section>

        </div>
      </section>
    </>
  );
}
