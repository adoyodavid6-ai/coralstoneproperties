import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Chevron, Pin } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Area guides — CoralStone",
  description: "Neighbourhood guides for East Africa's top property markets — Nairobi, Kampala, Dar es Salaam, Kigali and more.",
};

const AREAS = [
  {
    country: "Kenya 🇰🇪",
    slug: "kenya",
    areas: [
      { name: "Westlands, Nairobi", vibe: "Business & nightlife hub", types: "Apartments, offices, serviced suites", priceRange: "KSh 5M – 35M to buy · KSh 60K – 200K/mo to rent", highlights: "Walking distance to Sarit Centre & Westgate. Dense commercial zone. Strong short-let demand from expats.", intent: "sale" },
      { name: "Karen, Nairobi", vibe: "Leafy suburban retreat", types: "Villas, townhouses, land", priceRange: "KSh 20M – 150M to buy", highlights: "Large plots, mature gardens, good international schools. Popular with diplomats and senior executives.", intent: "sale" },
      { name: "Kilimani, Nairobi", vibe: "Young professionals & families", types: "Apartments, off-plan", priceRange: "KSh 8M – 40M to buy · KSh 50K – 150K/mo to rent", highlights: "High apartment density. Strong rental yields 6–8%. Close to CBD without the chaos.", intent: "rent" },
      { name: "Mombasa Island", vibe: "Coastal heritage & trade", types: "Houses, commercial, land", priceRange: "KSh 5M – 60M to buy", highlights: "Historic Old Town. Ferry access to Likoni. Slower pace. Growing port-city commercial demand.", intent: "sale" },
    ],
  },
  {
    country: "Uganda 🇺🇬",
    slug: "uganda",
    areas: [
      { name: "Kololo, Kampala", vibe: "Prestige hilltop", types: "Villas, embassies, high-end rentals", priceRange: "UGX 800M – 4B to buy · UGX 3M – 15M/mo to rent", highlights: "The address for diplomats and top executives. Limited supply keeps values strong.", intent: "rent" },
      { name: "Nakasero, Kampala", vibe: "CBD-adjacent business core", types: "Commercial, apartments, hotels", priceRange: "UGX 600M – 3B to buy", highlights: "Central location. Walking distance to government offices. High commercial demand.", intent: "sale" },
      { name: "Entebbe Road Corridor", vibe: "Suburban expansion", types: "Off-plan, gated communities, land", priceRange: "UGX 200M – 800M to buy", highlights: "Fast-growing corridor between Kampala and the airport. New estates, good infrastructure.", intent: "sale" },
    ],
  },
  {
    country: "Tanzania 🇹🇿",
    slug: "tanzania",
    areas: [
      { name: "Masaki, Dar es Salaam", vibe: "Upmarket peninsular enclave", types: "Villas, serviced apartments", priceRange: "USD 300K – 1.5M to buy · USD 2K – 8K/mo to rent", highlights: "Home to most expats and NGOs. Ocean views. Walking distance to Coco Beach.", intent: "rent" },
      { name: "Zanzibar Stone Town", vibe: "UNESCO heritage & tourism", types: "Boutique hotels, riads, land", priceRange: "USD 150K – 1M+", highlights: "Legal framework for foreign ownership via Right of Occupancy. Strong short-let and tourism returns.", intent: "short_let" },
      { name: "Arusha City", vibe: "Safari gateway & business hub", types: "Houses, land, commercial", priceRange: "TZS 100M – 800M to buy", highlights: "Gateway to Serengeti and Kilimanjaro. Growing conference tourism. Strong local demand.", intent: "sale" },
    ],
  },
  {
    country: "Rwanda 🇷🇼",
    slug: "rwanda",
    areas: [
      { name: "Kiyovu, Kigali", vibe: "Government & diplomatic quarter", types: "Villas, embassies, apartments", priceRange: "USD 200K – 1.5M to buy · USD 1.5K – 6K/mo to rent", highlights: "Most prestigious address in Kigali. Quiet, well-maintained, close to ministries.", intent: "rent" },
      { name: "Nyarutarama, Kigali", vibe: "Upmarket family suburb", types: "Villas, gated communities", priceRange: "USD 150K – 600K to buy", highlights: "Green, hillside suburbs. Good international schools nearby. Favoured by expats.", intent: "sale" },
      { name: "Kacyiru, Kigali", vibe: "Government & growing commercial", types: "Apartments, offices, off-plan", priceRange: "USD 80K – 300K to buy", highlights: "High off-plan activity. Newer buildings, better infrastructure. Strong yield potential.", intent: "sale" },
    ],
  },
];

export default function AreaGuidesPage() {
  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Know your market</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">Area guides</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Neighbourhood breakdowns for East Africa&apos;s top property markets —
          vibe, property types, price ranges and what makes each area tick.
        </p>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="space-y-14">
          {AREAS.map((country) => (
            <div key={country.slug}>
              <h2 className="font-serif text-2xl font-semibold text-primary">{country.country}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {country.areas.map((area) => (
                  <div key={area.name} className="flex flex-col rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                    <div className="flex items-start gap-2">
                      <Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <h3 className="font-semibold text-primary">{area.name}</h3>
                        <p className="text-xs text-ink-soft">{area.vibe}</p>
                      </div>
                    </div>

                    <dl className="mt-4 space-y-2.5">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-accent">Property types</dt>
                        <dd className="mt-0.5 text-sm text-ink-soft">{area.types}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-accent">Price range</dt>
                        <dd className="mt-0.5 figure text-sm font-medium text-primary">{area.priceRange}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wider text-accent">Why buyers choose it</dt>
                        <dd className="mt-0.5 text-sm text-ink-soft">{area.highlights}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 pt-4 border-t border-line">
                      <Link
                        href={`/search?intent=${area.intent}&country=${country.slug.charAt(0).toUpperCase() + country.slug.slice(1)}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:brightness-90"
                      >
                        Browse listings here
                        <Chevron className="h-4 w-4 -rotate-90" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Not sure which area suits you?</p>
        <p className="mt-1 text-sm text-white/55">Our team can match you with the right neighbourhood for your budget and lifestyle.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" variant="coral">Talk to an advisor</ButtonLink>
          <ButtonLink href="/search" variant="inverse">Browse all listings</ButtonLink>
        </div>
      </section>
    </>
  );
}
