import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Check, Phone, Globe } from "@/components/ui/icons";
import { LIVE_COUNTRIES } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Verified conveyancers — CoralStone",
  description: "Find verified, licensed conveyancers and property lawyers in Kenya — more East African markets coming soon.",
};

const CONVEYANCERS = [
  {
    country: "Kenya",
    flag: "🇰🇪",
    regulator: "Law Society of Kenya (LSK)",
    regulatorUrl: "https://www.lsk.or.ke",
    fee: "1–1.5% of property value (government-regulated scale)",
    timeline: "4–8 weeks for a residential transfer",
    providers: [
      { name: "Mboya Wangong'u & Waiyaki Advocates", city: "Nairobi", spec: "Residential & commercial" },
      { name: "Hamilton Harrison & Mathews", city: "Nairobi", spec: "High-value & off-plan" },
      { name: "Mombasa Conveyancing Partners", city: "Mombasa", spec: "Coastal land & title" },
    ],
  },
  {
    country: "Uganda",
    flag: "🇺🇬",
    regulator: "Uganda Law Society (ULS)",
    regulatorUrl: "https://www.uls.or.ug",
    fee: "1–2% of property value",
    timeline: "6–12 weeks (land title transfers via Lands Registry)",
    providers: [
      { name: "MMAKS Advocates", city: "Kampala", spec: "Commercial & residential" },
      { name: "AF Mpanga & Co Advocates", city: "Kampala", spec: "Land & title disputes" },
      { name: "Kampala Associated Advocates", city: "Kampala", spec: "Off-plan & developer projects" },
    ],
  },
  {
    country: "Tanzania",
    flag: "🇹🇿",
    regulator: "Tanganyika Law Society (TLS)",
    regulatorUrl: "https://www.tls.or.tz",
    fee: "1–2% of property value (no fixed scale)",
    timeline: "8–14 weeks (Right of Occupancy transfers)",
    providers: [
      { name: "Clyde & Co Tanzania", city: "Dar es Salaam", spec: "Commercial & foreign investment" },
      { name: "Felix Mrema & Co Advocates", city: "Dar es Salaam", spec: "Residential & land" },
      { name: "Zanzibar Property Legal Group", city: "Zanzibar", spec: "Zanzibar-specific land law" },
    ],
  },
  {
    country: "Rwanda",
    flag: "🇷🇼",
    regulator: "Rwanda Bar Association (RBA)",
    regulatorUrl: "https://www.rba.gov.rw",
    fee: "Flat fee or hourly (no fixed scale); typically RWF 500,000–2,000,000",
    timeline: "3–6 weeks (Rwanda Land Use and Management Information System)",
    providers: [
      { name: "Trust Law Associates", city: "Kigali", spec: "Residential & commercial" },
      { name: "Immobilier Legal Rwanda", city: "Kigali", spec: "Off-plan & developer" },
      { name: "East Africa Property Law", city: "Kigali", spec: "Cross-border transactions" },
    ],
  },
];

export default function ConveyancersPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Legal protection</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          Verified conveyancers
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Never buy property without independent legal advice. Our verified conveyancer network
          covers every market we operate in — vetted for licence, experience and reputation.
        </p>
      </section>

      {/* What is a conveyancer */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page py-12">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow">Why you need one</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">What does a conveyancer do?</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A conveyancer (also called a property lawyer or advocates in East Africa) handles the
              legal side of a property transaction. They search the title, draft the sale agreement,
              lodge stamp duty, register the transfer and protect you if anything goes wrong.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Conduct a title search at the Lands Registry",
                "Confirm the seller has clear, unencumbered ownership",
                "Review or draft the sale and purchase agreement",
                "Advise on stamp duty and registration costs",
                "Lodge the transfer documents with the relevant authority",
                "Ensure your name is registered on the new title deed",
                "Advise on land use, zoning and any restrictions",
                "Represent you if a dispute arises",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* By country */}
      <section className="container-page py-14 sm:py-18">
        <p className="eyebrow">Our network</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-primary">Verified practices by country</h2>
        <p className="mt-2 text-sm text-ink-soft">Kenya is live now — Uganda, Tanzania and Rwanda are coming soon.</p>

        <div className="mt-10 space-y-10">
          {CONVEYANCERS.filter((c) => (LIVE_COUNTRIES as string[]).includes(c.country)).map((c) => (
            <div key={c.country} className="rounded-2xl border border-line bg-surface-raised p-7 shadow-card">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-primary">{c.country}</h3>
                  <p className="text-xs text-ink-soft">
                    Regulated by{" "}
                    <a href={c.regulatorUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:brightness-90">
                      {c.regulator}
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-surface px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Typical fees</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.fee}</p>
                </div>
                <div className="rounded-lg bg-surface px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Timeline</p>
                  <p className="mt-1 text-sm text-ink-soft">{c.timeline}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Featured verified practices</p>
                {c.providers.map((p) => (
                  <div key={p.name} className="flex items-start justify-between gap-4 rounded-lg border border-line px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{p.name}</p>
                      <p className="text-xs text-ink-soft">{p.city} · {p.spec}</p>
                    </div>
                    <CheckShield className="h-5 w-5 shrink-0 text-accent" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Need a conveyancer introduction?</p>
        <p className="mt-1 text-sm text-white/55">
          Our team can connect you with a verified practice in your area.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" variant="coral">Request an introduction</ButtonLink>
          <ButtonLink href="/verification" variant="inverse">How verification works</ButtonLink>
        </div>
      </section>
    </>
  );
}
