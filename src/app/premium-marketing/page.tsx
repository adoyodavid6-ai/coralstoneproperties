import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Check, Sparkle, Star, Trend, Globe, Users, CheckShield } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Premium Marketing & Sales — CoralStones Properties",
  description:
    "Get your property marketed to serious buyers. Active promotion across YouTube and social media, professional presentation, and a success-based commission — 5% on land, 3% on developments.",
};

// ── The three listing options ────────────────────────────────────────────────
const OPTIONS = [
  {
    id: "standard",
    label: "Standard Listing",
    tagline: "Get seen on CoralStones",
    blurb: "Your property listed on the website with photos, pricing, location and enquiry inbox.",
    features: ["Website listing", "Standard search visibility", "Enquiry inbox", "Verified badge eligibility"],
    cta: { label: "List for free", href: "/list", variant: "outline" as const },
    highlight: false,
  },
  {
    id: "featured",
    label: "Featured Listing",
    tagline: "Priority placement",
    blurb: "Enhanced visibility and priority placement within relevant property categories.",
    features: ["Everything in Standard", "Priority in search results", "Homepage featured rail", "More photos & richer profile"],
    cta: { label: "Boost your listing", href: "/pricing", variant: "outline" as const },
    highlight: false,
  },
  {
    id: "premium",
    label: "Premium Marketing & Sales",
    tagline: "Marketed to serious buyers",
    blurb:
      "Full-service promotion: website listing, YouTube showcase, cross-platform digital marketing, lead generation — on a success-based commission.",
    features: [
      "Everything in Featured",
      "YouTube property showcase",
      "Social media marketing (FB, IG, TikTok)",
      "Professional presentation & drone footage",
      "Targeted buyer & diaspora outreach",
      "Lead generation & viewing coordination",
    ],
    cta: { label: "Get my property marketed", href: "/list?package=premium", variant: "coral" as const },
    highlight: true,
  },
];

const SERVICES = [
  { Icon: Star, title: "Premium website listing", body: "Enhanced profiles with professional descriptions, high-quality photos, pricing, location, amenities and contact details." },
  { Icon: Sparkle, title: "YouTube property showcase", body: "Video tours, promotional videos and dedicated property features published on our YouTube channel." },
  { Icon: Globe, title: "Social media marketing", body: "Promotion across Facebook, Instagram, TikTok and other suitable digital channels." },
  { Icon: CheckShield, title: "Professional presentation", body: "Where applicable: video walkthroughs, drone footage, location highlights and surrounding infrastructure features." },
  { Icon: Users, title: "Targeted buyer outreach", body: "Promotion to relevant audiences — homebuyers, land investors, developers and diaspora clients." },
  { Icon: Trend, title: "Lead generation & referrals", body: "We direct interested buyers to the lister and help coordinate communication, viewings and negotiations." },
];

const COMMISSION = [
  { category: "Land sales", rate: "5%", note: "of the final sale price" },
  { category: "Property developments — apartments & residential units", rate: "3%", note: "of the final sale price" },
];

const EXAMPLES = [
  { sale: "Land sold for KES 5,000,000", calc: "5% commission", amount: "KES 250,000" },
  { sale: "Development sold for KES 10,000,000", calc: "3% commission", amount: "KES 300,000" },
  { sale: "Development sold for KES 20,000,000", calc: "3% commission", amount: "KES 600,000" },
];

const STEPS = [
  "The property owner, agent or developer submits their property for listing.",
  "The lister selects the Premium Marketing Package.",
  "Our team verifies the property information and agrees on the marketing scope.",
  "The property is professionally presented and promoted across the selected platforms.",
  "Interested buyers are connected to the lister, with viewings and negotiations coordinated as agreed.",
  "On a successful sale attributable to our marketing or brokerage, the applicable commission becomes payable under the signed agreement.",
];

const TERMS = [
  "The commission rate and payment terms are agreed in writing before marketing begins.",
  "The agreement specifies whether commission applies to sales concluded directly by the lister or through buyers we introduce.",
  "The parties agree the duration of the marketing mandate and whether it is exclusive or non-exclusive.",
  "Any additional production, paid-advertising, travel or drone-filming costs are disclosed and agreed in advance.",
  "Commission is tied to a clearly defined transaction milestone — e.g. completion or receipt of the agreed purchase consideration.",
  "Ownership, authority to sell, pricing and supporting documents are verified before promotional content is published.",
];

export default function PremiumMarketingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-dark px-6 pb-20 pt-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-on-dark">
          <Sparkle className="h-3.5 w-3.5" /> Premium Marketing &amp; Sales
        </span>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold text-white sm:text-5xl">
          Get your property marketed to serious buyers
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          More than a listing. We actively promote your property across YouTube and social media,
          present it professionally, and connect you with qualified buyers — on a success-based
          commission payable only when your property sells.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/list?package=premium" size="lg" variant="coral">
            Get my property marketed
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
            Talk to our team
          </ButtonLink>
        </div>
      </section>

      {/* Three listing options */}
      <section className="container-page py-16 sm:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Choose how you list</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">Three ways to list your property</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
            From a free website listing to a full marketing-and-sales mandate — pick the level of reach you need.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {OPTIONS.map((o) => (
            <div
              key={o.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 shadow-card",
                o.highlight ? "border-accent bg-surface-dark text-white ring-2 ring-accent" : "border-line bg-surface-raised",
              )}
            >
              {o.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  Most reach
                </span>
              )}
              <p className={cn("text-sm font-semibold", o.highlight ? "text-accent-on-dark" : "text-accent")}>{o.tagline}</p>
              <h3 className={cn("mt-1 font-serif text-xl font-semibold", o.highlight ? "text-white" : "text-primary")}>{o.label}</h3>
              <p className={cn("mt-2 text-sm", o.highlight ? "text-white/70" : "text-ink-soft")}>{o.blurb}</p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {o.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", o.highlight ? "text-accent-on-dark" : "text-verified")} />
                    <span className={o.highlight ? "text-white/85" : "text-primary"}>{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href={o.cta.href} variant={o.cta.variant} className="mt-6 w-full justify-center">
                {o.cta.label}
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>

      {/* Services included */}
      <section className="border-y border-line bg-surface-muted">
        <div className="container-page py-16 sm:py-20">
          <h2 className="font-serif text-3xl font-semibold text-primary sm:text-4xl">What the premium package includes</h2>
          <p className="mt-3 max-w-2xl text-ink-soft">
            The exact services depend on the property, available marketing resources and the agreed package.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-primary">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Success-based commission</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">You only pay when it sells</h2>
            <p className="mt-3 text-ink-soft">
              No upfront marketing fee for the commission itself — the premium package runs on a
              success-based model, payable upon a successful sale under the signed agreement.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line">
              {COMMISSION.map((c, i) => (
                <div key={c.category} className={cn("flex items-center justify-between gap-4 p-4", i > 0 && "border-t border-line")}>
                  <span className="text-sm font-medium text-primary">{c.category}</span>
                  <span className="shrink-0 text-right">
                    <span className="figure text-2xl font-semibold text-accent">{c.rate}</span>
                    <span className="block text-[11px] text-ink-soft">{c.note}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
            <h3 className="font-serif text-lg font-semibold text-primary">Example calculations</h3>
            <ul className="mt-4 space-y-3">
              {EXAMPLES.map((e) => (
                <li key={e.sale} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-ink-soft">
                    {e.sale}
                    <span className="block text-xs text-ink-soft/70">{e.calc}</span>
                  </span>
                  <span className="figure shrink-0 font-semibold text-primary">{e.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-surface-muted">
        <div className="container-page py-16 sm:py-20">
          <h2 className="font-serif text-3xl font-semibold text-primary sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={i} className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <span className="figure grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-primary">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Terms */}
      <section className="container-page py-16 sm:py-20">
        <h2 className="font-serif text-3xl font-semibold text-primary sm:text-4xl">Important terms</h2>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Every premium mandate is governed by a written agreement so expectations are clear for both sides.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {TERMS.map((term) => (
            <li key={term} className="flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-4">
              <CheckShield className="mt-0.5 h-5 w-5 shrink-0 text-verified" />
              <span className="text-sm leading-relaxed text-ink-soft">{term}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Final CTA */}
      <section className="bg-surface-dark">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready to reach serious buyers?
          </h2>
          <p className="max-w-xl text-white/70">
            List your land, apartment or development under the Premium Marketing &amp; Sales package and let our
            team put it in front of the right audience.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/list?package=premium" size="lg" variant="coral">
              Get my property marketed
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20">
              Talk to our team
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
