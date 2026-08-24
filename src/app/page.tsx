import Image from "next/image";
import Link from "next/link";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { SplitHeading } from "@/lib/motion/SplitHeading";
import { Magnetic } from "@/lib/motion/Magnetic";
import { getFeatured } from "@/lib/data/properties";
import { Chevron } from "@/components/ui/icons";

const COUNTRIES = [
  {
    name: "Kenya",
    flag: "🇰🇪",
    tagline: "Nairobi, Mombasa, Kisumu",
    href: "/search?intent=sale&country=Kenya",
  },
  {
    name: "Uganda",
    flag: "🇺🇬",
    tagline: "Kampala, Entebbe, Jinja",
    href: "/search?intent=sale&country=Uganda",
  },
  {
    name: "Tanzania",
    flag: "🇹🇿",
    tagline: "Dar es Salaam, Zanzibar, Arusha",
    href: "/search?intent=sale&country=Tanzania",
  },
  {
    name: "Rwanda",
    flag: "🇷🇼",
    tagline: "Kigali, Musanze, Rubavu",
    href: "/search?intent=sale&country=Rwanda",
  },
];

export default function HomePage() {
  const featured = getFeatured(3);

  return (
    <>
      {/* Hero — short height maintained, rich landscape home */}
      <section className="relative overflow-hidden bg-surface-dark">
        {/* Background photo with layered overlay for cinematic depth */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85"
            alt="Modern luxury home with landscaped garden"
            fill
            className="object-cover object-[center_30%]"
            priority
          />
          {/* Base teal tone — reduced to 55% so the landscape breathes */}
          <div className="absolute inset-0 bg-surface-dark/55" />
          {/* Radial vignette — brightens centre (house), darkens edges */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 25%, rgba(22,66,91,0.55) 100%)",
            }}
          />
          {/* Bottom fade — anchors text legibility */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(to top, rgba(22,66,91,0.7) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="container-page relative py-24 text-center sm:py-32">
          <p className="eyebrow text-accent" data-animate="fade">
            East Africa&apos;s verified property platform
          </p>
          <SplitHeading className="mt-5 font-serif text-4xl font-semibold text-white sm:text-5xl lg:text-[3.75rem]">
            Find. Verify. Own.
          </SplitHeading>
          <p
            className="mx-auto mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/60"
            data-animate="fade"
          >
            Trusted agents, confirmed listings, clear titles — across Kenya,
            Uganda, Tanzania and Rwanda.
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
            className="mt-10 text-[0.7rem] tracking-[0.2em] text-white/30 uppercase"
            data-animate="fade"
          >
            Kenya · Uganda · Tanzania · Rwanda
          </p>
        </div>
      </section>

      {/* Browse by country — compact link cards */}
      <section className="border-b border-line bg-surface-raised py-10 sm:py-12">
        <div className="container-page">
          <p className="eyebrow mb-5" data-animate="fade">
            Buy by country
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-animate-group>
            {COUNTRIES.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                className="group flex items-center justify-between rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-accent hover:shadow-card"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl leading-none">{c.flag}</span>
                  <span>
                    <span className="block font-semibold text-primary transition-colors group-hover:text-accent">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-soft">
                      {c.tagline}
                    </span>
                  </span>
                </span>
                <Chevron className="h-4 w-4 -rotate-90 text-ink-soft transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured — 3 verified picks */}
      <section className="container-page py-14 sm:py-18">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-animate-group>
          {featured.map((p, i) => (
            <PropertyCard key={p.id} property={p} priority={i < 3} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <ButtonLink href="/search" variant="outline">
            Browse all properties
          </ButtonLink>
        </div>
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
