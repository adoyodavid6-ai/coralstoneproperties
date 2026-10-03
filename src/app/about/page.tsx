import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Users, Globe, Trend, Sparkle } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About CoralStones Properties Listings",
  description: "We built CoralStones to end ghost listings and property fraud in East Africa — one verified listing at a time.",
};

const VALUES = [
  {
    icon: <CheckShield className="h-6 w-6 text-accent" />,
    title: "Verification is not optional",
    body: "Every agent, agency, listing and title is checked before it reaches a buyer. Verification is the moat — not a footnote.",
  },
  {
    icon: <Users className="h-6 w-6 text-accent" />,
    title: "Buyers come first",
    body: "We earn from agents and sellers — but our duty is to protect the buyer. If a listing fails our checks, it does not go live.",
  },
  {
    icon: <Globe className="h-6 w-6 text-accent" />,
    title: "Built for East Africa",
    body: "M-Pesa payments, USSD access, Kiswahili support, SACCO group-buying. We are not a copy of a Western portal — we are built here.",
  },
  {
    icon: <Trend className="h-6 w-6 text-accent" />,
    title: "Transparency in every transaction",
    body: "Clear pricing, disclosed commissions, no hidden fees. What you see is what you pay.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-surface-dark px-6 py-20 text-center">
        <p className="eyebrow text-white/60">Our story</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-serif text-4xl font-semibold text-white sm:text-5xl">
          Trust-first property,<br />built for East Africa
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
          We built CoralStones after watching buyers lose savings to ghost listings, fake agents
          and forged title deeds. Our answer: verify everything before a single buyer sees it.
        </p>
      </section>

      {/* Mission */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Our mission</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Eliminate property fraud across East Africa
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
            <p>
              Property fraud costs East African families and investors hundreds of millions of shillings
              every year. Ghost listings lure buyers to non-existent homes. Fake agents collect
              deposits and disappear. Forged title deeds transfer land that was never for sale.
            </p>
            <p>
              CoralStones Properties Listings was created with one goal: make verified, trustworthy
              property listings the norm — not the exception. We do this by checking the agent,
              the agency, the listing, and for land, the title deed, before any property goes live
              on our platform.
            </p>
            <p>
              We&apos;re starting in Kenya — working with legal partners and licensed conveyancers —
              and plan to expand across East Africa from there. Listings are reviewed by a person,
              not just an algorithm, before they go live.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-muted py-16">
        <div className="container-page">
          <p className="eyebrow text-center">Our values</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <div className="mt-0.5 shrink-0 grid h-10 w-10 place-items-center rounded-full bg-accent-soft">
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we verify */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">The CoralStones guarantee</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary">
            Four layers. One promise.
          </h2>
          <div className="mt-8 space-y-5">
            {[
              { n: "01", title: "Agent verification", body: "Agents provide their licence number, ID and regulatory registration, which we check against the Estate Agents Registration Board (EARB)." },
              { n: "02", title: "Agency verification", body: "The agency or brokerage must hold a valid registration certificate and have no outstanding fraud reports. New agencies are placed on probation for 90 days." },
              { n: "03", title: "Listing verification", body: "We confirm photos are real, the location is accurate and the property exists as described. Spotlight listings include a site visit where needed." },
              { n: "04", title: "Title verification", body: "For land and high-value sales, we help run a title deed search at the relevant Lands Registry, and disclose any encumbrance, caveat or dispute we find." },
            ].map((step) => (
              <div key={step.n} className="flex gap-5 rounded-xl border border-line bg-surface-raised px-6 py-5">
                <span className="figure shrink-0 text-2xl font-semibold text-accent/40">{step.n}</span>
                <div>
                  <h3 className="font-semibold text-primary">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/verification" className="text-sm font-semibold text-accent hover:brightness-90">
              Full verification process →
            </Link>
          </div>
        </div>
      </section>

      {/* Presence */}
      <section className="bg-surface-dark py-14 text-center">
        <p className="eyebrow text-white/60">Where we operate</p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-white">
          {[
            { flag: "🇰🇪", name: "Kenya",    cities: "Nairobi · Mombasa · Kisumu · Nakuru", soon: false },
            { flag: "🇺🇬", name: "Uganda",   cities: "Kampala · Entebbe · Jinja · Mbarara", soon: true },
            { flag: "🇹🇿", name: "Tanzania", cities: "Dar es Salaam · Zanzibar · Arusha · Mwanza", soon: true },
            { flag: "🇷🇼", name: "Rwanda",   cities: "Kigali · Musanze · Rubavu · Huye", soon: true },
          ].map((c) => (
            <div key={c.name} className={`rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-left ${c.soon ? "opacity-50" : ""}`}>
              <span className="text-3xl">{c.flag}</span>
              <p className="mt-2 font-semibold text-white">
                {c.name}
                {c.soon ? <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">Soon</span> : null}
              </p>
              <p className="mt-0.5 text-xs text-white/55">{c.cities}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/search" variant="coral">Browse verified listings</ButtonLink>
          <ButtonLink href="/contact" variant="inverse">Get in touch</ButtonLink>
        </div>
      </section>
    </>
  );
}
