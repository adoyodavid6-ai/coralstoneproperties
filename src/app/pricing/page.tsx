import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { CheckShield, Check, Trend, Sparkle, Users, Globe, Star } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { VerificationKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pricing — CoralStone Properties",
  description:
    "Transparent pricing for agents, developers and buyers. Free listing, paid promotion, subscriptions, verification and transaction fees — all designed for the East African market.",
};

// ── Listing boost tiers ──────────────────────────────────────────────────────
const BOOST_TIERS = [
  {
    id: "free",
    label: "Free",
    price: "KSh 0",
    period: "forever",
    blurb: "Get your property in front of buyers. No credit card needed.",
    highlight: false,
    features: [
      "1 active listing",
      "Standard search visibility",
      "Enquiry inbox",
      "Basic listing analytics",
    ],
    cta: "List for free",
    ctaVariant: "outline" as const,
  },
  {
    id: "featured",
    label: "Featured",
    price: "KSh 750",
    period: "per 7 days",
    blurb: "Move up the results page and appear in the homepage featured rail.",
    highlight: false,
    features: [
      "Priority placement in search results",
      "Homepage 'Verified & featured' rail",
      "Up to 20 photos",
      "Extended caption & description",
      "Seen by verified buyers first",
    ],
    cta: "Boost your listing",
    ctaVariant: "outline" as const,
  },
  {
    id: "spotlight",
    label: "Spotlight",
    price: "KSh 2,250",
    period: "per 7 days",
    blurb: "Top billing everywhere on the platform, including the 3D immersive showcase.",
    highlight: true,
    features: [
      "Top position across every page",
      "Immersive 3D showcase stage",
      "Drone & walkthrough video tours",
      "Maximum photo allowance",
      "Priority in diaspora & USD/GBP views",
      "Dedicated listing concierge",
    ],
    cta: "Get Spotlight",
    ctaVariant: "coral" as const,
  },
];

// ── Agent subscription plans ─────────────────────────────────────────────────
const AGENT_PLANS = [
  {
    id: "starter",
    label: "Starter",
    price: "KSh 2,000",
    period: "per year",
    sub: "≈ KSh 167 / month",
    highlight: false,
    cap: "10 active listings",
    features: [
      "10 active listings",
      "Enquiry inbox",
      "Basic analytics dashboard",
      "Standard search visibility",
      "Extra listings billed individually",
    ],
    cta: "Get Starter",
    ctaVariant: "outline" as const,
  },
  {
    id: "professional",
    label: "Professional",
    price: "KSh 5,000",
    period: "/ month",
    sub: null,
    highlight: true,
    cap: "50 active listings",
    features: [
      "50 active listings",
      "1 free Featured boost each month",
      "Lead management CRM",
      "Advanced analytics & reports",
      "WhatsApp enquiry integration",
      "Priority agent verification badge",
      "Appear in professional agent directory",
    ],
    cta: "Start free trial",
    ctaVariant: "primary" as const,
  },
  {
    id: "corporate",
    label: "Corporate",
    price: "From KSh 15,000",
    period: "/ month",
    sub: "Up to KSh 30,000 / month",
    highlight: false,
    cap: "Unlimited listings",
    features: [
      "Unlimited active listings",
      "Multiple agent seats",
      "Full analytics suite",
      "Dedicated developer project page",
      "3 free Spotlight boosts each month",
      "Branded agency profile page",
      "Priority onboarding & support",
    ],
    cta: "Contact us",
    ctaVariant: "outline" as const,
  },
];

// ── Verification tiers ───────────────────────────────────────────────────────
const VERIF_TIERS: {
  label: string;
  price: string;
  kind: VerificationKind;
  blurb: string;
}[] = [
  {
    label: "Basic",
    price: "KSh 1,000",
    kind: "listing",
    blurb: "Listing photos, location and property details confirmed as real.",
  },
  {
    label: "Standard",
    price: "KSh 2,500",
    kind: "agent",
    blurb: "Listing verification plus agent identity and licence credentials checked.",
  },
  {
    label: "Full Title",
    price: "KSh 5,000",
    kind: "title",
    blurb: "Title deed search, ownership confirmed, all badges awarded. Required for land.",
  },
];

// ── Additional revenue streams ───────────────────────────────────────────────
const STREAMS = [
  {
    icon: <Trend className="h-6 w-6" />,
    title: "Commission on sale",
    body: "1.5%–5% on a successfully completed property transaction. Paid by the lister, the buyer, or split — agreed at listing time.",
    example: "KSh 80,000 earned on a KSh 8M sale at 1%.",
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Booking & reservation fee",
    body: "10% of the deposit when a buyer or tenant reserves a property through the platform. Higher-value transactions always use a percentage, never a flat fee.",
    example: "KSh 10,000 earned on a KSh 100,000 deposit.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Pay-per-lead",
    body: "Agents and developers pay for qualified, platform-verified leads. Ordinary enquiries cost KSh 100–300; a verified, highly-qualified buyer costs KSh 500–1,000.",
    example: "30 qualified leads × KSh 300 = KSh 9,000.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Fixed listing fee (no commission)",
    body: "List and promote for KSh 5,000–10,000 upfront with no success commission. Or list free and pay 1–5% only if the property sells through the platform.",
    example: "You choose: pay now, or pay on success.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-dark px-6 pb-20 pt-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(700px 320px at 85% 0%, rgb(22 66 91 / 0.35), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow text-white/60">Transparent monetisation</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl">
            One platform.&nbsp;
            <span className="text-rose">Nine ways</span> to grow.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Free access brings people onto the platform. Paid promotion generates
            immediate revenue. Leads generate recurring revenue. Subscriptions make
            it predictable. Commissions generate high-value revenue when transactions close.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/list" size="lg" variant="coral">
              List a property
            </ButtonLink>
            <ButtonLink href="#plans" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
              See agent plans
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Revenue principle strip ──────────────────────────────────────── */}
      <section className="border-y border-line bg-surface-muted">
        <div className="container-page grid divide-y divide-line sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {[
            { label: "Free listing", detail: "Builds the database" },
            { label: "Paid promotion", detail: "Immediate revenue" },
            { label: "Subscriptions", detail: "Predictable monthly" },
            { label: "Qualified leads", detail: "Recurring revenue" },
            { label: "Commissions", detail: "High-value at close" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-5 text-center">
              <span className="text-sm font-semibold text-primary">{s.label}</span>
              <span className="mt-0.5 text-xs text-ink-soft">{s.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Listing tiers ────────────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Listing promotion</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Free to list. Pay for the results you want.
          </h2>
          <p className="mt-3 text-[15px] text-ink-soft">
            A normal listing is free. Featured and Spotlight placements give your property
            the visibility edge — priced to work for both KSh 2M rentals and KSh 50M sales.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BOOST_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 shadow-card",
                tier.highlight
                  ? "border-accent bg-surface-dark text-white"
                  : "border-line bg-surface-raised",
              )}
            >
              {tier.highlight && (
                <span className="absolute right-5 top-5 rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <p
                className={cn(
                  "text-sm font-semibold uppercase tracking-widest",
                  tier.highlight ? "text-accent-on-dark" : "text-accent",
                )}
              >
                {tier.label}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className={cn(
                    "figure text-3xl font-semibold",
                    tier.highlight ? "text-white" : "text-primary",
                  )}
                >
                  {tier.price}
                </span>
                <span className={cn("text-sm", tier.highlight ? "text-white/60" : "text-ink-soft")}>
                  {tier.period}
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  tier.highlight ? "text-white/70" : "text-ink-soft",
                )}
              >
                {tier.blurb}
              </p>
              <ul className="mt-5 grow space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        tier.highlight ? "text-rose" : "text-verified",
                      )}
                    />
                    <span className={tier.highlight ? "text-white/80" : "text-ink-soft"}>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <ButtonLink
                  href="/search"
                  variant={tier.ctaVariant}
                  className={cn(
                    "w-full",
                    tier.highlight && "bg-rose text-white hover:brightness-105",
                  )}
                >
                  {tier.cta}
                </ButtonLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agent subscription plans ─────────────────────────────────────── */}
      <section id="plans" className="bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Agent & agency subscriptions</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              A subscription plan for every scale.
            </h2>
            <p className="mt-3 text-[15px] text-ink-soft">
              Predictable monthly revenue for the platform; predictable costs and more leads
              for you. Agents on paid plans close deals faster — they receive more enquiries,
              higher-quality leads and priority verification.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {AGENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 shadow-card",
                  plan.highlight
                    ? "border-accent bg-surface-raised ring-2 ring-accent"
                    : "border-line bg-surface-raised",
                )}
              >
                {plan.highlight && (
                  <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                  {plan.label}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="figure text-3xl font-semibold text-primary">{plan.price}</span>
                  <span className="text-sm text-ink-soft">{plan.period}</span>
                </div>
                {plan.sub && (
                  <p className="figure mt-1 text-xs text-ink-soft">{plan.sub}</p>
                )}
                <p className="mt-2 rounded-lg bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent">
                  {plan.cap}
                </p>
                <ul className="mt-5 grow space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                      <span className="text-ink-soft">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <ButtonLink href="/search" variant={plan.ctaVariant} className="w-full">
                    {plan.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            All plans include access to the enquiry inbox, the moderation-reviewed listing process, and
            basic analytics. Prices are in Kenyan Shillings; Uganda, Tanzania and Rwanda equivalents
            available on request.
          </p>
        </div>
      </section>

      {/* ── Developer packages ───────────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Developer project packages</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              One developer. Hundreds of units.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Property developers are the platform&apos;s highest-value commercial partners. A single
              developer brings hundreds of units, a branded project page, and a long-lived
              marketing relationship — not a one-off listing fee.
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Dedicated project page",
                  price: "From KSh 50,000 / month",
                  detail:
                    "All units on one branded page. Includes photos, videos, floor plans, payment plans, available unit tracker, enquiry flow and booking functionality.",
                },
                {
                  title: "Premium marketing campaign",
                  price: "KSh 100,000 – 300,000+",
                  detail:
                    "Full digital campaign — external traffic, social, SEO and partner placements. Scoped to the development size and target audience.",
                },
                {
                  title: "Transaction commission",
                  price: "1.5% – 5% on completion",
                  detail:
                    "Optional on top of the package fee. Aligns the platform&apos;s incentive with the developer&apos;s — we earn more when you sell more.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-line bg-surface-raised p-5 shadow-card">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-serif text-lg text-primary">{item.title}</h3>
                    <span className="figure whitespace-nowrap text-sm font-semibold text-rose">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <ButtonLink href="/search" variant="primary">
                Talk to our developer team
              </ButtonLink>
            </div>
          </div>

          {/* Platform revenue illustration */}
          <div className="rounded-3xl border border-line bg-surface-raised p-8 shadow-card">
            <div className="flex items-center gap-3 border-b border-line pb-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-soft text-rose">
                <Trend className="h-6 w-6" />
              </span>
              <div>
                <p className="font-serif text-lg text-primary">Example: One KSh 8M listing</p>
                <p className="text-sm text-ink-soft">What the platform can earn from a single property</p>
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {[
                { label: "Featured boost (7 days)", value: "KSh 1,000" },
                { label: "20 qualified leads × KSh 300", value: "KSh 6,000" },
                { label: "1% transaction commission", value: "KSh 80,000" },
                { label: "Booking reservation fee (10%)", value: "KSh 10,000" },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-ink-soft">{row.label}</span>
                  <span className="figure font-semibold text-primary">{row.value}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm font-semibold">
                <span className="text-primary">Total from one property</span>
                <span className="figure text-lg text-rose">KSh 97,000</span>
              </li>
            </ul>
            <p className="mt-5 text-xs text-ink-soft">
              The goal is not to become another listing site. The platform earns at every stage:
              discovery, verification, enquiry, viewing, reservation, and completion.
            </p>
          </div>
        </div>
      </section>

      {/* ── Verification fees ────────────────────────────────────────────── */}
      <section className="bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Property verification</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                Trust is the moat — and the revenue.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                In the Kenyan real estate market, buyers are right to be cautious. Verified
                properties earn more enquiries and faster offers. Agents with verification
                badges win the trust competition before a word is exchanged.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                We charge a verification fee to cover the human review, the document checks
                and the title search. The badge is the proof — not a sticker.
              </p>
            </div>

            <div className="space-y-4">
              {VERIF_TIERS.map((tier) => (
                <div
                  key={tier.label}
                  className="flex items-start gap-5 rounded-xl border border-line bg-surface-raised p-5 shadow-card"
                >
                  <VerifiedBadge kind={tier.kind} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-serif text-base font-medium text-primary">
                        {tier.label} verification
                      </h3>
                      <span className="figure whitespace-nowrap text-sm font-semibold text-rose">
                        {tier.price}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{tier.blurb}</p>
                  </div>
                </div>
              ))}
              <p className="pt-1 text-sm text-ink-soft">
                Verified listings, agents and developers receive a permanent badge displayed
                on every search result, property card and detail page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Additional revenue streams ───────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Transaction & lead revenue</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            Revenue at every stage of the journey.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2" data-animate-group>
          {STREAMS.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-accent">
                {s.icon}
              </span>
              <h3 className="mt-4 font-serif text-lg text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              <p className="mt-3 rounded-lg bg-rose-soft px-3 py-2 text-sm font-medium text-rose">
                Example: {s.example}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Premium buyer membership ─────────────────────────────────────── */}
      <section className="bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <div className="grid items-center gap-8 rounded-3xl border border-line bg-surface-raised p-8 shadow-card md:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow">Premium buyer membership</p>
                <h2 className="mt-3 font-serif text-2xl font-semibold text-primary sm:text-3xl">
                  Searching stays free. Serious buyers go further.
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                  The platform needs as many buyers and tenants as possible — so basic property
                  search is always free. Premium members get an edge before anyone else sees the
                  listing.
                </p>
                <ul className="mt-5 space-y-2">
                  {[
                    "Early access to new listings before they go public",
                    "Price reduction alerts on saved properties",
                    "Investment opportunity signals & yield estimates",
                    "Advanced filters & side-by-side property comparison",
                    "Priority booking & viewing slots",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                      <span className="text-ink-soft">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0 text-center">
                <p className="figure text-4xl font-semibold text-primary">KSh 100</p>
                <p className="text-sm text-ink-soft">to KSh 500 / month</p>
                <ButtonLink href="/search" variant="primary" className="mt-5">
                  Join as premium buyer
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommended model summary ────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Who pays what</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
            The right model for every user type.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              who: "Property owner",
              icon: <CheckShield className="h-6 w-6" />,
              streams: [
                "Free listing",
                "Optional paid promotion",
                "Verification badge (KSh 1,000–5,000)",
                "Commission on sale or lease",
              ],
            },
            {
              who: "Real estate agent",
              icon: <Users className="h-6 w-6" />,
              streams: [
                "Free (1 listing) or annual subscription",
                "Paid promotion on key listings",
                "Qualified lead charges",
                "Success commission",
              ],
            },
            {
              who: "Property developer",
              icon: <Sparkle className="h-6 w-6" />,
              streams: [
                "Corporate subscription",
                "Dedicated project pages",
                "Premium marketing campaigns",
                "Transaction commission",
              ],
            },
            {
              who: "Buyer / tenant",
              icon: <Globe className="h-6 w-6" />,
              streams: [
                "Search is always free",
                "Property viewing fees (future)",
                "Booking & reservation fee",
                "Premium buyer membership",
              ],
            },
          ].map((col) => (
            <div
              key={col.who}
              className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                {col.icon}
              </span>
              <h3 className="mt-4 font-serif text-lg text-primary">{col.who}</h3>
              <ul className="mt-3 space-y-2">
                {col.streams.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="container-page pb-20">
        <div className="grain relative overflow-hidden rounded-3xl bg-surface-dark px-8 py-14 text-center ring-1 ring-white/10 sm:px-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(700px 300px at 90% 0%, rgb(22 66 91 / 0.25) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">
              Ready to list where trust already lives?
            </h2>
            <p className="mt-4 text-white/75">
              Start with a free listing today. Upgrade when you want more visibility,
              more leads, and more closings.
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
