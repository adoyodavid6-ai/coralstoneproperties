"use client";

/**
 * Horizontal, expanding pricing explorer for the four commercial tracks.
 * - Desktop: hovering (or keyboard-focusing) a panel expands it to reveal a
 *   price breakdown; the others shrink.
 * - Any device: clicking/tapping a panel opens a modal with the full details.
 * Mobile (stacked) shows the breakdown inline since there's no hover.
 */

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Trend, Users, Sparkle, CheckShield, Check, Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Tier = { name: string; price: string; period?: string; features: string[] };
type Category = {
  id: string;
  title: string;
  tagline: string;
  blurb: string;
  Icon: typeof Trend;
  cta: { label: string; href: string };
  tiers: Tier[];
};

const CATEGORIES: Category[] = [
  {
    id: "listing",
    title: "Listing promotion",
    tagline: "Free to list · pay for reach",
    blurb: "A standard listing is free. Featured and Spotlight placements buy your property the visibility edge in search and across the platform.",
    Icon: Sparkle,
    cta: { label: "List a property", href: "/list" },
    tiers: [
      { name: "Free", price: "KSh 0", period: "forever", features: ["1 active listing", "Standard search visibility", "Enquiry inbox", "Basic analytics"] },
      { name: "Featured", price: "KSh 750", period: "per 7 days", features: ["Priority in search results", "Homepage featured rail", "Up to 20 photos", "Seen by verified buyers first"] },
      { name: "Spotlight", price: "KSh 2,250", period: "per 7 days", features: ["Top position everywhere", "Immersive 3D showcase", "Drone & walkthrough tours", "Priority in diaspora views", "Dedicated concierge"] },
    ],
  },
  {
    id: "agents",
    title: "Agent & agency subscriptions",
    tagline: "Predictable monthly plans",
    blurb: "Paid plans mean more listings, better leads and priority verification. Scale from a solo agent to a full agency.",
    Icon: Users,
    cta: { label: "See agent plans", href: "#plans" },
    tiers: [
      { name: "Starter", price: "KSh 2,000", period: "per year (≈ KSh 167/mo)", features: ["10 active listings", "Enquiry inbox", "Basic analytics", "Standard search visibility"] },
      { name: "Professional", price: "KSh 5,000", period: "per month", features: ["50 active listings", "1 free Featured boost / month", "Lead management CRM", "Advanced analytics", "WhatsApp enquiries", "Priority verification badge"] },
      { name: "Corporate", price: "From KSh 15,000", period: "per month", features: ["Unlimited listings", "Multiple agent seats", "Dedicated developer project page", "3 free Spotlight boosts / month", "Branded agency profile", "Priority onboarding"] },
    ],
  },
  {
    id: "developer",
    title: "Developer project packages",
    tagline: "One developer, hundreds of units",
    blurb: "Branded project pages and full marketing campaigns for developments — a long-lived partnership, not a one-off listing fee.",
    Icon: Trend,
    cta: { label: "Talk to our developer team", href: "/contact" },
    tiers: [
      { name: "Dedicated project page", price: "From KSh 50,000", period: "per month", features: ["All units on one branded page", "Photos, videos & floor plans", "Payment plans & unit tracker", "Enquiry & booking flow"] },
      { name: "Premium marketing campaign", price: "KSh 100,000 – 300,000+", features: ["External traffic & social", "SEO & partner placements", "Scoped to development size & audience"] },
      { name: "Transaction commission", price: "1.5% – 5%", period: "on completion", features: ["Optional, on top of the package fee", "Aligns platform & developer incentives"] },
    ],
  },
  {
    id: "verification",
    title: "Property verification",
    tagline: "Earn the trust badges",
    blurb: "Every check that turns a listing into a verified one — from photos and location to a full title-deed search.",
    Icon: CheckShield,
    cta: { label: "How verification works", href: "/verification" },
    tiers: [
      { name: "Basic", price: "KSh 1,000", features: ["Listing photos, location & details confirmed real", "Listing verified badge"] },
      { name: "Standard", price: "KSh 2,500", features: ["Everything in Basic", "Agent identity & licence checked", "Agent verified badge"] },
      { name: "Full Title", price: "KSh 5,000", features: ["Title-deed search & ownership confirmed", "All badges awarded", "Required for land"] },
    ],
  },
];

export function PricingExplorer() {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = CATEGORIES.find((c) => c.id === openId) ?? null;

  // Lock scroll + allow Esc to close while the modal is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <section className="container-page py-14 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Explore pricing</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
          Four ways we work together
        </h2>
        <p className="mt-3 text-[15px] text-ink-soft">
          Hover any track for a quick price breakdown — click it for the full details.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 lg:h-[22rem] lg:flex-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOpenId(c.id)}
            aria-label={`View ${c.title} details`}
            className={cn(
              "group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface-dark p-6 text-left text-white shadow-card transition-all duration-300 ease-out",
              "hover:border-accent focus-visible:border-accent focus:outline-none",
              "lg:flex-[1] lg:hover:flex-[2.4] lg:focus-visible:flex-[2.4]",
            )}
          >
            {/* Accent wash */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "radial-gradient(420px 220px at 0% 0%, rgb(255 133 89 / 0.18), transparent 70%)" }}
            />
            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white/10 text-accent-on-dark">
              <c.Icon className="h-5 w-5" />
            </span>
            <h3 className="relative mt-4 font-serif text-xl font-semibold leading-tight">{c.title}</h3>
            <p className="relative mt-1 text-sm text-white/60">{c.tagline}</p>

            {/* Price breakdown — inline on mobile, reveal-on-hover on desktop */}
            <div
              className={cn(
                "relative mt-4 space-y-2 overflow-hidden transition-all duration-300",
                "lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-56 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-56 lg:group-focus-visible:opacity-100",
              )}
            >
              {c.tiers.map((t) => (
                <div key={t.name} className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-2 text-sm">
                  <span className="text-white/80">{t.name}</span>
                  <span className="figure shrink-0 font-semibold text-accent-on-dark">{t.price}</span>
                </div>
              ))}
            </div>

            <span className="relative mt-auto pt-4 text-sm font-semibold text-accent-on-dark">
              View full details →
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-primary/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setOpenId(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface-raised p-6 shadow-float sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <active.Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-primary">{active.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{active.blurb}</p>
                </div>
              </div>
              <button
                onClick={() => setOpenId(null)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong text-primary"
                aria-label="Close"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {active.tiers.map((t) => (
                <div key={t.name} className="rounded-xl border border-line bg-surface p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h4 className="font-serif text-lg text-primary">{t.name}</h4>
                    <span className="figure text-sm font-semibold text-accent">
                      {t.price}
                      {t.period && <span className="ml-1 font-normal text-ink-soft">{t.period}</span>}
                    </span>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <ButtonLink href={active.cta.href} variant="coral">
                {active.cta.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
