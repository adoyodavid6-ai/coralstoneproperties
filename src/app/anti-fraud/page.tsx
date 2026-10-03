import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Flag, Check } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Anti-fraud policy — CoralStones",
  description: "How CoralStones prevents property fraud and what to do if you encounter suspicious activity.",
};

const SCAMS = [
  {
    name: "Ghost listings",
    description: "A property is advertised but does not exist — or has already been sold. The scammer collects viewing fees or deposits, then disappears.",
    signs: ["Agent is difficult to reach after initial contact", "Rushed to pay a reservation fee before viewing", "Photos look too perfect or are identical across multiple platforms"],
  },
  {
    name: "Agent impersonation",
    description: "Fraudsters pose as legitimate licensed agents, often cloning real agent profiles with slightly different contact details.",
    signs: ["Contact number differs from official agency website", "Agent cannot provide their registration number", "Meeting location is outside the agency office"],
  },
  {
    name: "Fake title deeds",
    description: "A seller presents a forged or duplicate title deed to sell land they do not own, or land with existing charges/owners.",
    signs: ["Seller insists on a rushed transaction", "Price is unusually far below market value", "Seller reluctant to allow title search at Lands Registry"],
  },
  {
    name: "Off-plan advance fee fraud",
    description: "A developer collects deposits for an off-plan project that does not have planning approval, or the developer has no intention of building.",
    signs: ["No construction bond or NCA certificate provided", "Developer cannot show approved plans", "Payment demanded in cash or personal account"],
  },
];

export default function AntiFraudPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-18 text-center">
        <p className="eyebrow text-white/60">Safety first</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">Anti-fraud policy</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Property fraud is one of the biggest financial risks facing East African buyers.
          Here is how we protect you — and how to protect yourself.
        </p>
      </section>

      {/* CoralStones' protections */}
      <section className="container-page py-14 sm:py-18">
        <p className="eyebrow">How CoralStones protects you</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-primary">Our zero-tolerance approach</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {[
            { title: "Human review before publishing", body: "As a standard policy, listings are reviewed by our team before they go live — we don't auto-publish." },
            { title: "Agent licence checks", body: "We check agents against the Estate Agents Registration Board of Kenya (EARB) register." },
            { title: "Title deed searches", body: "For land and high-value sales, we help you run a title search at the relevant Lands Registry and flag any encumbrances it reveals." },
            { title: "Every fraud report reviewed", body: "We review every fraud report. Confirmed fraudulent listings are removed and the lister banned." },
            { title: "Payment protection guidance", body: "We advise all buyers to pay through formal bank channels only — never cash, never mobile money to personal numbers." },
            { title: "Permanent bans", body: "Any agent or lister found to be fraudulent is permanently banned and reported to the relevant authorities." },
          ].map((p) => (
            <div key={p.title} className="flex gap-3 rounded-xl border border-line bg-surface-raised p-5">
              <CheckShield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h3 className="text-sm font-semibold text-primary">{p.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common scams */}
      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <p className="eyebrow">Know the scams</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary">
            Common property fraud types in East Africa
          </h2>
          <div className="mt-8 space-y-6">
            {SCAMS.map((s) => (
              <div key={s.name} className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <div className="flex items-start gap-3">
                  <Flag className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <h3 className="font-semibold text-primary">{s.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.description}</p>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Warning signs</p>
                      <ul className="mt-2 space-y-1">
                        {s.signs.map((sign) => (
                          <li key={sign} className="flex items-start gap-2 text-sm text-ink-soft">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            {sign}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to do */}
      <section className="container-page py-14 sm:py-18">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">If you suspect fraud</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">What to do immediately</h2>
          <ol className="mt-6 space-y-4">
            {[
              { n: "1", action: "Stop all payments", detail: "Do not send any money — including viewing fees, reservation deposits or registration fees — until the issue is resolved." },
              { n: "2", action: "Report the listing", detail: "Use our Report a Listing tool. We'll investigate as quickly as we can and suspend the listing if fraud is confirmed." },
              { n: "3", action: "Contact us directly", detail: "Email report@coralstonesproperties.co.ke with any evidence — screenshots, payment receipts, conversation records." },
              { n: "4", action: "Report to authorities", detail: "File a report with the Directorate of Criminal Investigations (DCI) in Kenya, and notify your bank immediately if any money changed hands." },
            ].map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="figure grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold text-primary">{step.action}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Spotted something suspicious?</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/report" variant="coral">Report a listing</ButtonLink>
          <ButtonLink href="/contact" variant="inverse">Contact our team</ButtonLink>
        </div>
      </section>
    </>
  );
}
