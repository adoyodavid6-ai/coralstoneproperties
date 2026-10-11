import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Check, Trend, Globe, Sparkle } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { VerificationKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pricing — CoralStones Properties",
  description:
    "Simple, honest pricing. Free to list and free to search — pay only for extra visibility, verification, or when a sale completes.",
};

// ── Listing tiers (property owners) ──────────────────────────────────────────
const BOOST_TIERS = [
  {
    id: "free",
    label: "Free",
    price: "KSh 0",
    period: "forever",
    blurb: "Get your property in front of buyers — no card needed.",
    highlight: false,
    features: ["1 active listing", "Appears in search", "Enquiry inbox", "Basic analytics"],
    cta: "List for free",
    ctaVariant: "outline" as const,
  },
  {
    id: "featured",
    label: "Featured",
    price: "KSh 750",
    period: "per 7 days",
    blurb: "Move up the results and onto the homepage featured rail.",
    highlight: true,
    features: ["Priority in search results", "Homepage featured rail", "Up to 20 photos", "Seen by verified buyers first"],
    cta: "Boost a listing",
    ctaVariant: "coral" as const,
  },
  {
    id: "spotlight",
    label: "Spotlight",
    price: "KSh 2,250",
    period: "per 7 days",
    blurb: "Top billing across the whole platform.",
    highlight: false,
    features: ["Top position everywhere", "Immersive 3D showcase", "Drone & video tours", "Priority in USD/GBP views"],
    cta: "Get Spotlight",
    ctaVariant: "outline" as const,
  },
];

// ── Verification tiers ───────────────────────────────────────────────────────
const VERIF_TIERS: { label: string; price: string; kind: VerificationKind; blurb: string }[] = [
  { label: "Basic", price: "KSh 1,000", kind: "listing", blurb: "Photos, location and property details confirmed as real." },
  { label: "Standard", price: "KSh 2,500", kind: "agent", blurb: "Adds agent identity and licence credential checks." },
  { label: "Full Title", price: "KSh 5,000", kind: "title", blurb: "Title-deed search and ownership confirmed. Required for land." },
];

// ── Agent & agency plans ─────────────────────────────────────────────────────
const AGENT_PLANS = [
  {
    id: "starter",
    label: "Starter",
    price: "KSh 2,000",
    period: "per year",
    sub: "≈ KSh 167 / month",
    highlight: false,
    features: ["10 active listings", "Enquiry inbox", "Basic analytics", "Appears in search"],
    cta: "Get Starter",
    href: "/list",
    ctaVariant: "outline" as const,
  },
  {
    id: "professional",
    label: "Professional",
    price: "KSh 5,000",
    period: "per month",
    sub: "50 active listings",
    highlight: true,
    features: ["50 active listings", "1 free Featured boost / month", "Lead management CRM", "WhatsApp enquiries", "Priority verification badge"],
    cta: "Start Professional",
    href: "/list",
    ctaVariant: "coral" as const,
  },
  {
    id: "corporate",
    label: "Corporate",
    price: "From KSh 15,000",
    period: "per month",
    sub: "Unlimited listings",
    highlight: false,
    features: ["Unlimited listings", "Multiple agent seats", "Branded agency page", "Dedicated support"],
    cta: "Contact us",
    href: "/contact",
    ctaVariant: "outline" as const,
  },
];

// ── Buyer membership perks ───────────────────────────────────────────────────
const BUYER_PERKS = [
  "Early access to new listings",
  "Price-drop alerts on saved properties",
  "Advanced filters & side-by-side compare",
  "Priority booking & viewing slots",
];

const JUMP = [
  { href: "#owners", label: "Property owners" },
  { href: "#agents", label: "Agents & agencies" },
  { href: "#developers", label: "Developers" },
  { href: "#buyers", label: "Buyers" },
];

function FeatureList({ items, onDark = false }: { items: string[]; onDark?: boolean }) {
  return (
    <ul className="mt-5 grow space-y-2.5">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5 text-sm">
          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", onDark ? "text-accent-on-dark" : "text-verified")} />
          <span className={onDark ? "text-white/80" : "text-ink-soft"}>{f}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface-dark px-6 pb-16 pt-20 text-center sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-white/60">Pricing</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/75">
            It&apos;s free to list your property and free to search. You only pay for extra
            visibility, verification, or a commission when a sale completes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/list" size="lg" variant="coral">
              List a property free
            </ButtonLink>
            <ButtonLink href="/search" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
              Browse properties
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Jump links ───────────────────────────────────────────────────── */}
      <nav aria-label="Pricing sections" className="sticky top-16 z-20 border-b border-line bg-surface-raised/95 backdrop-blur">
        <div className="container-page flex flex-wrap items-center justify-center gap-2 py-3">
          {JUMP.map((j) => (
            <a
              key={j.href}
              href={j.href}
              className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              {j.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Property owners ──────────────────────────────────────────────── */}
      <section id="owners" className="container-page scroll-mt-28 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Property owners</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            List your property
          </h2>
          <p className="mt-3 text-[15px] text-ink-soft">
            Listing is always free. Choose a boost only when you want more visibility — and you
            only pay a commission (agreed upfront) if it sells through CoralStones.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BOOST_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 shadow-card",
                tier.highlight ? "border-accent bg-surface-dark text-white" : "border-line bg-surface-raised",
              )}
            >
              {tier.highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <p className={cn("text-sm font-semibold uppercase tracking-widest", tier.highlight ? "text-accent-on-dark" : "text-accent")}>
                {tier.label}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={cn("figure text-3xl font-semibold", tier.highlight ? "text-white" : "text-primary")}>
                  {tier.price}
                </span>
                <span className={cn("text-sm", tier.highlight ? "text-white/60" : "text-ink-soft")}>{tier.period}</span>
              </div>
              <p className={cn("mt-2 text-sm leading-relaxed", tier.highlight ? "text-white/70" : "text-ink-soft")}>
                {tier.blurb}
              </p>
              <FeatureList items={tier.features} onDark={tier.highlight} />
              <div className="mt-7">
                <ButtonLink
                  href="/list"
                  variant={tier.ctaVariant}
                  className={cn("w-full", tier.highlight && "bg-rose text-white hover:brightness-105")}
                >
                  {tier.cta}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>

        {/* Verification — compact, folded into the owner journey */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Optional · get verified</p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-primary">
                  Earn the trust badges buyers look for
                </h3>
              </div>
              <a href="/verification" className="text-sm font-semibold text-accent hover:brightness-90">
                How verification works →
              </a>
            </div>
            <div className="mt-5 space-y-3">
              {VERIF_TIERS.map((tier) => (
                <div key={tier.label} className="flex items-start gap-4 rounded-xl border border-line bg-surface p-4">
                  <VerifiedBadge kind={tier.kind} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-medium text-primary">{tier.label} verification</h4>
                      <span className="figure shrink-0 text-sm font-semibold text-rose">{tier.price}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{tier.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Agents & agencies ────────────────────────────────────────────── */}
      <section id="agents" className="scroll-mt-28 bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Agents &amp; agencies</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              Plans that scale with you
            </h2>
            <p className="mt-3 text-[15px] text-ink-soft">
              More listings, better leads and priority verification — from a solo agent to a full agency.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {AGENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-surface-raised p-7 shadow-card",
                  plan.highlight ? "border-accent ring-2 ring-accent" : "border-line",
                )}
              >
                {plan.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">{plan.label}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="figure text-3xl font-semibold text-primary">{plan.price}</span>
                  <span className="text-sm text-ink-soft">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">{plan.sub}</p>
                <FeatureList items={plan.features} />
                <div className="mt-7">
                  <ButtonLink href={plan.href} variant={plan.ctaVariant} className="w-full">
                    {plan.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-ink-soft">
            All plans include the enquiry inbox, the reviewed listing process and basic analytics. Prices in Kenyan Shillings.
          </p>
        </div>
      </section>

      {/* ── Developers ───────────────────────────────────────────────────── */}
      <section id="developers" className="container-page scroll-mt-28 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface-raised p-8 shadow-card sm:p-10">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-accent">
            <Trend className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-primary sm:text-3xl">
            For developers
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
            A branded project page for all your units, plus full-service marketing — a long-term
            partnership, not a one-off listing. Pricing is scoped to your development.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { t: "Branded project page", p: "From KSh 50,000 / mo" },
              { t: "Marketing campaign", p: "Scoped to the project" },
              { t: "Commission on sales", p: "Optional, on completion" },
            ].map((d) => (
              <div key={d.t} className="rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-medium text-primary">{d.t}</p>
                <p className="figure mt-1 text-sm font-semibold text-rose">{d.p}</p>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <ButtonLink href="/contact" variant="primary">
              Talk to our developer team
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Buyers & tenants ─────────────────────────────────────────────── */}
      <section id="buyers" className="scroll-mt-28 bg-surface-muted py-16 sm:py-20">
        <div className="container-page mx-auto max-w-3xl">
          <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface-raised p-8 shadow-card sm:p-10 md:grid-cols-[1fr_auto]">
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Globe className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-primary sm:text-3xl">
                For buyers &amp; tenants
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Searching is always free. An optional membership gives serious buyers a head start.
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {BUYER_PERKS.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                    <span className="text-ink-soft">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0 text-center">
              <p className="figure text-4xl font-semibold text-primary">Free</p>
              <p className="mt-1 text-sm text-ink-soft">to search · membership from KSh 100/mo</p>
              <ButtonLink href="/search" variant="primary" className="mt-5">
                Start searching
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-surface-dark px-8 py-14 text-center sm:px-16">
          <div className="mx-auto max-w-2xl">
            <Sparkle className="mx-auto h-7 w-7 text-accent-on-dark" />
            <h2 className="mt-4 font-serif text-3xl font-semibold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-white/75">
              List your property free today. Upgrade only when you want more reach.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/list" size="lg" variant="coral">
                List your property free
              </ButtonLink>
              <ButtonLink href="/search" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
                Browse properties
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
