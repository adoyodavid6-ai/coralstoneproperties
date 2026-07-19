import Link from "next/link";
import { ImmersiveHero } from "@/components/home/ImmersiveHero";
import { PropertyShowcase } from "@/components/showcase/PropertyShowcase";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ButtonLink } from "@/components/ui/Button";
import { SplitHeading } from "@/lib/motion/SplitHeading";
import { Magnetic } from "@/lib/motion/Magnetic";
import { Counter } from "@/lib/motion/Counter";
import { getAllProperties, getFeatured, getTrending } from "@/lib/data/properties";
import {
  CheckShield,
  Sparkle,
  Trend,
  Globe,
  Clock,
  Pin,
  Chevron,
} from "@/components/ui/icons";
import type { VerificationKind } from "@/lib/types";

const PILLARS = [
  {
    icon: <CheckShield className="h-6 w-6" />,
    title: "Trust & verification",
    body: "Fake listings, double-selling and ghost agents end here. We verify the agent, the agency, the listing and — for land — the title before it reaches you.",
  },
  {
    icon: <Trend className="h-6 w-6" />,
    title: "Decision intelligence",
    body: "See the true monthly cost, the real rental yield, and honest neighbourhood truth — so you know whether it's a good decision, not just an available one.",
  },
  {
    icon: <Sparkle className="h-6 w-6" />,
    title: "Conversion & lifecycle",
    body: "From first enquiry to booked viewing, reservation, offer and completion — we own the whole chain. Ordinary sites stop at 'send enquiry.'",
  },
];

const VERIF_KINDS: { kind: VerificationKind; blurb: string }[] = [
  { kind: "agent", blurb: "ID & credentials checked" },
  { kind: "agency", blurb: "Registered, office confirmed" },
  { kind: "listing", blurb: "Property & media confirmed real" },
  { kind: "title", blurb: "Ownership & title searched" },
  { kind: "developer", blurb: "Scheme rights confirmed" },
];

const TOOLS = [
  { icon: <Trend className="h-5 w-5" />, title: "True monthly cost", body: "Every real cost itemised — rent or mortgage plus service charge, rates, utilities and insurance." },
  { icon: <Sparkle className="h-5 w-5" />, title: "Mortgage & affordability", body: "Real East African bank-rate presets, stamp duty and legal estimates, and 'what can I afford?'." },
  { icon: <Pin className="h-5 w-5" />, title: "Neighbourhood truth", body: "Security, water, power and road-access signals — plus verified-resident reviews." },
  { icon: <Globe className="h-5 w-5" />, title: "Diaspora hub", body: "Local/USD/GBP toggle, remote viewings, verified-developer filter and escrow reservations." },
];

export default function HomePage() {
  const featured = getFeatured(6);
  const trending = getTrending(6, featured.map((p) => p.id));
  const showcase = getAllProperties();

  return (
    <>
      {/* The hero carries its own dark cinematic scope; the page below is warm cream */}
      <ImmersiveHero properties={showcase} />

      {/* Pillars */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow" data-animate="fade">Three pillars, one promise</p>
          <SplitHeading className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Everything ordinary sites do — decisively out-classed on what matters.
          </SplitHeading>
        </div>
        <div className="mt-14">
          {PILLARS.map((p, i) => (
            <div key={p.title}>
              <div className="hairline-gradient" data-animate="line" />
              <div
                className="grid gap-4 py-9 md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.9fr)_minmax(0,1.2fr)] md:items-start md:gap-8"
                data-animate
              >
                <span className="figure text-sm text-rose">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex items-center gap-3 font-serif text-2xl text-primary sm:text-3xl">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-accent">
                    {p.icon}
                  </span>
                  {p.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-soft">{p.body}</p>
              </div>
            </div>
          ))}
          <div className="hairline-gradient" data-animate="line" />
        </div>
      </section>

      {/* Featured listings */}
      <section className="relative overflow-hidden bg-surface-muted py-16 sm:py-20">
        {/* Soft warm wash — a touch of rose warmth over the cream */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(680px 320px at 12% 0%, rgb(255 49 49 / 0.06), transparent 60%)",
          }}
        />
        <div className="container-page relative">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow" data-animate="fade">Verified &amp; featured</p>
              <SplitHeading className="mt-2 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                Handpicked homes you can trust
              </SplitHeading>
            </div>
            <Link
              href="/search"
              className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-rose hover:brightness-90 sm:inline-flex"
            >
              View all
              <Chevron className="h-4 w-4 -rotate-90" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-animate-group>
            {featured.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} />
            ))}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <ButtonLink href="/search" variant="outline">
              View all properties
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Trending — a dark cinematic band that echoes the hero and carries the
          theme through the page. .theme-dark re-themes every token in scope. */}
      <section className="theme-dark grain relative overflow-hidden bg-surface py-16 text-ink sm:py-20">
        {/* Luminous brand wash top-right, mirroring the hero's glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(760px 340px at 88% 8%, rgb(67 113 154 / 0.28), transparent 62%)",
          }}
        />
        <div className="container-page relative">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow" data-animate="fade">Trending across East Africa</p>
              <SplitHeading className="mt-2 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                What buyers are moving on this week
              </SplitHeading>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft" data-animate="fade">
                The most-viewed and most-saved verified listings right now — from Nairobi
                townhouses to Kigali apartments and serviced plots outside the city.
              </p>
            </div>
            <Link
              href="/search?sort=trending"
              className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-rose hover:brightness-110 sm:inline-flex"
            >
              See what&apos;s hot
              <Chevron className="h-4 w-4 -rotate-90" />
            </Link>
          </div>

          <div className="mt-8" data-animate="fade">
            <PropertyShowcase properties={trending} stageHeight="clamp(320px, 48vh, 520px)" />
          </div>

          <div className="mt-10 text-center sm:hidden">
            <ButtonLink href="/search" variant="accent">
              Browse all listings
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Verification explainer — the moat */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-verified-soft px-3 py-1.5 text-sm font-medium text-verified ring-1 ring-verified/20">
              <CheckShield className="h-4 w-4" />
              Verification is the moat — not a footnote
            </span>
            <SplitHeading className="mt-5 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              Six checks stand between you and a scam.
            </SplitHeading>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              East Africa's property market runs on trust it can't always prove. We make the
              proof visible: every badge tells you exactly what was checked and when —
              hover any of them to see the guarantee. AI helps our moderators flag risk,
              but no listing is verified, no money moves, and no title clears without a
              human signing off.
            </p>
            <div className="mt-7 space-y-3" data-animate-group="scale">
              {VERIF_KINDS.map((v) => (
                <div key={v.kind} className="flex items-center gap-3">
                  <VerifiedBadge kind={v.kind} />
                  <span className="text-sm text-ink-soft">{v.blurb}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface-raised p-8 shadow-card" data-animate>
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-verified">
                <CheckShield className="h-6 w-6" />
              </span>
              <div>
                <p className="font-serif text-lg text-primary">Clone-listing detection</p>
                <p className="text-sm text-ink-soft">Image + text similarity catches scraped scams.</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-5 pt-6">
              {[
                { icon: <Clock className="h-4 w-4" />, n: <Counter to={9} suffix=" min" />, k: "median agent response" },
                { icon: <CheckShield className="h-4 w-4" />, n: <Counter to={100} suffix="%" />, k: "listings human-reviewed" },
                { icon: <Trend className="h-4 w-4" />, n: <Counter to={3120} />, k: "fraud reports actioned" },
                { icon: <Globe className="h-4 w-4" />, n: <span className="figure">EN · SW</span>, k: "full-parity everywhere" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-surface-muted p-4">
                  <span className="inline-flex items-center gap-2 text-accent">{s.icon}</span>
                  <dt className="figure mt-2 text-2xl font-semibold text-primary">{s.n}</dt>
                  <dd className="mt-0.5 text-xs text-ink-soft">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Decision intelligence tools */}
      <section className="bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow" data-animate="fade">Decision intelligence</p>
            <SplitHeading className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              Know if it's a good decision — not just an available one.
            </SplitHeading>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-animate-group>
            {TOOLS.map((tool) => (
              <div key={tool.title} className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-soft text-rose">
                  {tool.icon}
                </span>
                <h3 className="mt-4 font-serif text-lg text-primary">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tool.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="grain relative overflow-hidden rounded-3xl bg-surface-dark px-8 py-14 text-center text-white ring-1 ring-white/10 sm:px-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(700px 300px at 90% 0%, rgb(74 121 168 / 0.25) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <SplitHeading className="font-serif text-3xl font-semibold text-white sm:text-4xl">
              Selling or letting? List where trust already lives.
            </SplitHeading>
            <p className="mt-4 text-white/80" data-animate="fade">
              Verified agents get more enquiries, faster. Publish with confidence, track
              views and saves, and convert leads through to completion — all in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <ButtonLink
                  href="/search"
                  size="lg"
                  variant="primary"
                  className="ring-1 ring-white/25"
                >
                  List a property
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink
                  href="/search"
                  size="lg"
                  className="bg-accent text-white ring-1 ring-white/25 hover:bg-accent-hover"
                >
                  Browse properties
                </ButtonLink>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
