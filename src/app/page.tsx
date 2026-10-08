import type { ComponentType } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { SplitHeading } from "@/lib/motion/SplitHeading";
import { Magnetic } from "@/lib/motion/Magnetic";
import { getFeatured, getTrending } from "@/lib/data/listings";
import { Chevron, Calendar, Users, Bed, Star, Area, Cube } from "@/components/ui/icons";
import { HeroVideo } from "@/components/home/HeroVideo";

// Featured picks come from live inventory. Serve a cached shell and refresh
// every 5 minutes (ISR) rather than rendering per request — the homepage was
// the one slow page (cold render + 2 DB queries on every hit). Newly published
// listings appear within ~5 min instead of instantly, a fine launch trade-off.
export const revalidate = 300;

// The most sought-after ways people search — each links straight into the
// matching /search filter.
const CATEGORIES: {
  name: string;
  tagline: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    name: "Short-let apartments",
    tagline: "Airbnb-style stays, booked by the night",
    href: "/search?intent=short_let",
    Icon: Calendar,
  },
  {
    name: "Event venues",
    tagline: "Gardens, halls & rooftops for your day",
    href: "/search?type=venue",
    Icon: Users,
  },
  {
    name: "Apartments",
    tagline: "City flats to buy or rent",
    href: "/search?type=apartment",
    Icon: Bed,
  },
  {
    name: "Houses & villas",
    tagline: "Family homes and gated estates",
    href: "/search?type=house",
    Icon: Star,
  },
  {
    name: "Land & plots",
    tagline: "Verified titles, ready to build",
    href: "/search?type=land",
    Icon: Area,
  },
  {
    name: "Off-plan",
    tagline: "New developments at launch prices",
    href: "/search?type=off_plan",
    Icon: Cube,
  },
];

export default async function HomePage() {
  // Fill a 4×4 showcase (16): boosted/featured listings first, then top up with
  // other active verified listings so the block reads full.
  const boosted = await getFeatured(16);
  const topUp =
    boosted.length < 16
      ? await getTrending(16 - boosted.length, boosted.map((p) => p.id))
      : [];
  const featured = [...boosted, ...topUp].slice(0, 16);

  return (
    <>
      {/* Hero — cinematic villa video (Higgsfield / Veo 3.1) behind the copy */}
      <section className="relative flex min-h-[72svh] items-center overflow-hidden bg-surface-dark">
        <div aria-hidden className="absolute inset-0">
          <HeroVideo />
          {/* Even dark wash so white copy reads over the bright sunset */}
          <div className="absolute inset-0 bg-[rgba(11,20,28,0.42)]" />
          {/* Radial vignette — darkens edges, keeps the centre luminous */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 20%, rgba(22,66,91,0.6) 100%)",
            }}
          />
          {/* Bottom fade — anchors text legibility and blends into the page */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(22,66,91,0.8) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="container-page relative w-full py-24 text-center [text-shadow:0_1px_14px_rgba(0,0,0,0.35)] sm:py-32">
          <p className="eyebrow text-accent" data-animate="fade">
            East Africa&apos;s verified property platform
          </p>
          <SplitHeading className="mt-5 font-serif text-4xl font-semibold text-white sm:text-5xl lg:text-[3.75rem]">
            Find. Verify. Own.
          </SplitHeading>
          <p
            className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/80"
            data-animate="fade"
          >
            Trusted agents, confirmed listings, clear titles — now live across
            Kenya.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic>
              <ButtonLink href="/search" variant="coral" size="lg">
                Browse properties
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href="/pricing" variant="inverse" size="lg">
                For agents &amp; agencies
              </ButtonLink>
            </Magnetic>
          </div>
          <p
            className="mt-10 text-[0.7rem] tracking-[0.2em] text-white/60 uppercase"
            data-animate="fade"
          >
            Kenya now — Uganda, Tanzania &amp; Rwanda coming soon
          </p>
        </div>
      </section>

      {/* Most sought-after — category quick-links into the matching search filter */}
      <section className="border-b border-line bg-surface-raised py-10 sm:py-12">
        <div className="container-page">
          <div className="mb-5 flex items-end justify-between gap-4">
            <p className="eyebrow" data-animate="fade">
              Most sought-after
            </p>
            <Link
              href="/search"
              className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-accent hover:brightness-90 sm:inline-flex"
            >
              Browse all
              <Chevron className="h-4 w-4 -rotate-90" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-animate-group>
            {CATEGORIES.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                className="group flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-accent hover:shadow-card"
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                    <c.Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-primary transition-colors group-hover:text-accent">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-soft">{c.tagline}</span>
                  </span>
                </span>
                <Chevron className="h-4 w-4 -rotate-90 text-ink-soft transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured — 3 verified picks, or the launch state while inventory is empty */}
      <section className="container-page py-14 sm:py-18">
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface-raised px-6 py-14 text-center">
            <p className="eyebrow" data-animate="fade">
              Verified &amp; featured
            </p>
            <SplitHeading className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              Verified listings are arriving soon
            </SplitHeading>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              Every property on CoralStones is checked — the agent, the listing
              and the title — before it goes live. Selling or letting? Be among
              the first on the platform.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/list" variant="coral">
                List your property
              </ButtonLink>
              <ButtonLink href="/verification" variant="outline">
                How verification works
              </ButtonLink>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow" data-animate="fade">
                  Verified &amp; featured
                </p>
                <SplitHeading className="mt-2 font-serif text-3xl font-semibold text-primary sm:text-4xl">
                  Handpicked homes you can trust
                </SplitHeading>
              </div>
              <Link
                href="/search"
                className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-accent hover:brightness-90 sm:inline-flex"
              >
                Browse all
                <Chevron className="h-4 w-4 -rotate-90" />
              </Link>
            </div>

            {/* 4 columns on desktop → up to 4 rows of 4 (16 listings) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-animate-group>
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 4} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <ButtonLink href="/search" variant="outline">
                Browse all properties
              </ButtonLink>
            </div>
          </>
        )}
      </section>

      {/* CTA — compact dark bar */}
      <section className="bg-surface-dark py-10 sm:py-12">
        <div className="container-page flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-white">
              Selling or letting? List where trust already lives.
            </p>
            <p className="mt-1 text-sm text-white/50">
              Verified agents get more enquiries, faster.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ButtonLink href="/list" variant="coral" size="sm">
              List a property
            </ButtonLink>
            <ButtonLink href="/pricing" variant="inverse" size="sm">
              View pricing
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
