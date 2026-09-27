import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Check, Globe, Phone } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Diaspora hub — CoralStone",
  description: "Buying property in East Africa from abroad. Your complete guide to remote purchasing, currency, legal process and power of attorney.",
};

const STEPS = [
  { n: "01", title: "Identify the property", detail: "Browse verified listings on CoralStone. All listings show USD and GBP equivalents in addition to local currency." },
  { n: "02", title: "Appoint a local representative", detail: "Grant Power of Attorney (POA) to a trusted person or your conveyancer in-country. They can attend viewings, sign documents and lodge title transfers on your behalf. Your conveyancer can prepare the POA for you to sign abroad." },
  { n: "03", title: "Conduct due diligence", detail: "Your appointed conveyancer will search the title, confirm ownership and check for encumbrances. CoralStone's Full Title verification adds a second layer of independent confirmation." },
  { n: "04", title: "Transfer funds through official channels", detail: "Use your bank's international wire transfer or a regulated FX provider (not informal channels). Retain proof of transfer — it is required for future title resales and to prove legitimate acquisition." },
  { n: "05", title: "Complete the transaction", detail: "Your POA holder signs the sale agreement and lodge the transfer with the Lands Registry. Allow 4–12 weeks depending on the country. Your name appears on the new title deed." },
  { n: "06", title: "Manage your property remotely", detail: "CoralStone can connect you with verified property managers and letting agents in each country for ongoing management, rental income collection and maintenance." },
];

const CURRENCIES = [
  { pair: "KES", name: "Kenyan Shilling", note: "Most liquid EA market. USD widely accepted for high-value sales." },
  { pair: "USD", name: "US Dollar", note: "Common for high-value and diaspora purchases; a hedge against local FX swings." },
  { pair: "GBP", name: "Pound Sterling", note: "Popular with UK-based diaspora buyers; converted at the point of transfer." },
];

export default function DiasporaPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Buying from abroad</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          Diaspora hub
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
          Everything you need to buy, invest in, or rent out property across East Africa —
          without being on the ground.
        </p>
      </section>

      {/* Step by step */}
      <section className="container-page py-14 sm:py-18">
        <p className="eyebrow">The remote buying process</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-primary">
          Six steps to owning property from abroad
        </h2>
        <div className="mt-10 space-y-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-5 rounded-2xl border border-line bg-surface-raised px-6 py-5 shadow-card">
              <span className="figure grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">{s.n}</span>
              <div>
                <h3 className="font-semibold text-primary">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Currency guide */}
      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <p className="eyebrow">Currency guide</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">What currency do you pay in?</h2>
          <p className="mt-3 text-sm text-ink-soft max-w-2xl">
            Property prices in East Africa are typically quoted in local currency, but many high-value
            transactions (especially for foreign buyers) are completed in USD. Always transfer through
            a regulated bank or FX provider — proof of transfer is required for future resales.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CURRENCIES.map((c) => (
              <div key={c.pair} className="rounded-xl border border-line bg-surface-raised p-5">
                <p className="figure text-lg font-semibold text-accent">{c.pair}</p>
                <p className="text-sm font-medium text-primary">{c.name}</p>
                <p className="mt-2 text-xs text-ink-soft">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POA & legal */}
      <section className="container-page py-14 sm:py-18">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal framework</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">Power of attorney &amp; foreign ownership</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft">
            <p>
              <strong className="text-primary">Can foreigners own property in Kenya?</strong> Yes,
              with some restrictions. Foreigners can hold long-term leases of up to 99 years and can own
              apartments (sectional titles) outright; agricultural land is reserved for citizens. Always
              consult a licensed conveyancer for advice specific to your situation.
            </p>
            <p>
              <strong className="text-primary">Power of Attorney (POA)</strong> allows a trusted individual
              in-country — often your conveyancer — to sign documents on your behalf. Your POA must be
              notarised in your country of residence and apostilled (or legalised at the relevant East
              African high commission) before it is valid locally.
            </p>
            <p>
              <strong className="text-primary">Proof of funds</strong> is required for all property
              purchases above certain thresholds. Keep full records of your international wire transfers.
              Some countries require evidence of source of funds for amounts above USD 10,000.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/conveyancers" className="text-sm font-semibold text-accent hover:brightness-90">
              Find a verified conveyancer →
            </Link>
          </div>
        </div>
      </section>

      {/* CoralStone diaspora services */}
      <section className="bg-surface-dark py-14">
        <div className="container-page">
          <p className="eyebrow text-white/60 text-center">How we help diaspora buyers</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { icon: <Globe className="h-6 w-6 text-accent" />, title: "USD & GBP pricing", body: "All listings show USD and GBP equivalents alongside local currency — no guesswork." },
              { icon: <CheckShield className="h-6 w-6 text-accent" />, title: "Remote verification", body: "Full Title verification confirms ownership without you needing to be in the country." },
              { icon: <Phone className="h-6 w-6 text-accent" />, title: "Remote-friendly enquiries", body: "Enquire, ask questions and arrange viewings through a local representative — all without being in the country." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft/10">{s.icon}</div>
                <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/search" variant="coral">Browse verified listings</ButtonLink>
            <ButtonLink href="/contact" variant="inverse">Speak to our diaspora team</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
