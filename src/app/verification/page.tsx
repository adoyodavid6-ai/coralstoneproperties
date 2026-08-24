import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Check } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "How verification works — CoralStone",
  description: "Every listing on CoralStone is human-verified before it goes live. Here is exactly how we do it.",
};

const STAGES = [
  {
    n: "01",
    title: "Agent verification",
    timeline: "1–2 business days",
    items: [
      "Government-issued ID confirmed",
      "Estate agent licence number cross-checked with the national registration board",
      "Previous fraud or disciplinary record search",
      "Active agency membership confirmed",
    ],
    badge: "Agent verified",
  },
  {
    n: "02",
    title: "Agency verification",
    timeline: "2–3 business days",
    items: [
      "Company registration certificate confirmed",
      "Physical office address verified by site visit or video call",
      "Operating licence and tax compliance checked",
      "90-day probation period for new agencies",
    ],
    badge: "Agency verified",
  },
  {
    n: "03",
    title: "Listing verification",
    timeline: "24 hours",
    items: [
      "Photos cross-referenced against public satellite imagery and street view",
      "Location coordinates confirmed accurate",
      "Stated price benchmarked against comparable sales in the area",
      "Property description reviewed for accuracy and completeness",
      "Site visit conducted for all Spotlight-tier listings",
    ],
    badge: "Listing verified",
  },
  {
    n: "04",
    title: "Title verification",
    timeline: "3–5 business days",
    items: [
      "Title deed searched at the Lands Registry in the relevant country",
      "Ownership chain confirmed — no disputed transfers",
      "Encumbrances, caveats and charges disclosed to buyer",
      "Boundary survey results reviewed where available",
      "Required for all land and off-plan listings",
    ],
    badge: "Title verified",
  },
];

const TIERS = [
  { label: "Basic", price: "KSh 1,000", covers: "Listing photos, location and property details" },
  { label: "Standard", price: "KSh 2,500", covers: "Basic + agent identity and licence", highlight: true },
  { label: "Full Title", price: "KSh 5,000", covers: "Everything + title deed search and ownership" },
];

export default function VerificationPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-18 text-center">
        <p className="eyebrow text-white/60">Trust infrastructure</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          How verification works
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
          Every listing on CoralStone passes through up to four human-reviewed verification
          stages before a buyer ever sees it. Here is exactly what we check and why.
        </p>
      </section>

      {/* Why it matters */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { figure: "1 in 3", label: "East African property listings contain inaccurate information" },
            { figure: "KSh 2B+", label: "Lost to ghost listings and fake agents annually in Kenya alone" },
            { figure: "100%", label: "of CoralStone listings are reviewed by a human before going live" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center px-6 py-8 text-center">
              <span className="figure text-2xl font-semibold text-accent">{s.figure}</span>
              <span className="mt-2 text-sm text-ink-soft">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Verification stages */}
      <section className="container-page py-16 sm:py-20">
        <p className="eyebrow">The four stages</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
          What we check at every step
        </h2>

        <div className="mt-10 space-y-6">
          {STAGES.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-surface-raised p-7 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft">
                    <CheckShield className="h-5 w-5 text-accent" />
                  </span>
                  <div>
                    <span className="figure text-xs text-accent">{s.n}</span>
                    <h3 className="font-serif text-xl font-semibold text-primary">{s.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {s.badge}
                  </span>
                  <span className="text-xs text-ink-soft">{s.timeline}</span>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Verification tiers */}
      <section className="bg-surface-muted py-16">
        <div className="container-page">
          <p className="eyebrow text-center">Verification tiers</p>
          <h2 className="mt-3 text-center font-serif text-2xl font-semibold text-primary">
            Choose the level of assurance you need
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.label}
                className={`rounded-2xl border p-6 ${t.highlight ? "border-accent bg-surface-raised ring-2 ring-accent" : "border-line bg-surface-raised"}`}
              >
                {t.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">Recommended</span>
                )}
                <h3 className="font-semibold text-primary">{t.label}</h3>
                <p className="figure mt-1 text-2xl font-semibold text-primary">{t.price}</p>
                <p className="mt-3 text-sm text-ink-soft">{t.covers}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            Verification is paid by the listing agent or property owner.{" "}
            <Link href="/pricing" className="text-accent hover:brightness-90">Full pricing →</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Ready to get your listing verified?</p>
        <p className="mt-1 text-sm text-white/55">Verified listings receive 2.5× more enquiries.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/list" variant="coral">List a property</ButtonLink>
          <ButtonLink href="/search" variant="inverse">Browse verified listings</ButtonLink>
        </div>
      </section>
    </>
  );
}
