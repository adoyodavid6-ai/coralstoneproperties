import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Chevron, Pin } from "@/components/ui/icons";
import { LIVE_COUNTRIES } from "@/lib/countries";

export const metadata: Metadata = {
  title: "Area guides — CoralStone",
  description: "Neighbourhood guides for Kenya's top property markets — Nairobi, Mombasa, Kisumu and more.",
};

const AREAS = [
  {
    country: "Kenya 🇰🇪",
    slug: "kenya",
    areas: [
      { name: "Westlands, Nairobi", vibe: "Business & nightlife hub", types: "Apartments, offices, serviced suites", highlights: "Walking distance to Sarit Centre & Westgate. Dense commercial zone. Strong short-let demand from expats.", intent: "sale", image: "/images/areas/westlands.png" },
      { name: "Karen, Nairobi", vibe: "Leafy suburban retreat", types: "Villas, townhouses, land", highlights: "Large plots, mature gardens, good international schools. Popular with diplomats and senior executives.", intent: "sale", image: "/images/areas/karen.png" },
      { name: "Kilimani, Nairobi", vibe: "Young professionals & families", types: "Apartments, off-plan", highlights: "High apartment density. Close to CBD without the chaos.", intent: "rent", image: "/images/areas/kilimani.png" },
      { name: "Mombasa Island", vibe: "Coastal heritage & trade", types: "Houses, commercial, land", highlights: "Historic Old Town. Ferry access to Likoni. Slower pace. Growing port-city commercial demand.", intent: "sale", image: "/images/areas/mombasa-island.png" },
    ],
  },
  {
    country: "Uganda 🇺🇬",
    slug: "uganda",
    areas: [
      { name: "Kololo, Kampala", vibe: "Prestige hilltop", types: "Villas, embassies, high-end rentals", highlights: "The address for diplomats and top executives. Limited supply keeps values strong.", intent: "rent" },
      { name: "Nakasero, Kampala", vibe: "CBD-adjacent business core", types: "Commercial, apartments, hotels", highlights: "Central location. Walking distance to government offices. High commercial demand.", intent: "sale" },
      { name: "Entebbe Road Corridor", vibe: "Suburban expansion", types: "Off-plan, gated communities, land", highlights: "Fast-growing corridor between Kampala and the airport. New estates, good infrastructure.", intent: "sale" },
    ],
  },
  {
    country: "Tanzania 🇹🇿",
    slug: "tanzania",
    areas: [
      { name: "Masaki, Dar es Salaam", vibe: "Upmarket peninsular enclave", types: "Villas, serviced apartments", highlights: "Home to most expats and NGOs. Ocean views. Walking distance to Coco Beach.", intent: "rent" },
      { name: "Zanzibar Stone Town", vibe: "UNESCO heritage & tourism", types: "Boutique hotels, riads, land", highlights: "Legal framework for foreign ownership via Right of Occupancy. Strong short-let and tourism returns.", intent: "short_let" },
      { name: "Arusha City", vibe: "Safari gateway & business hub", types: "Houses, land, commercial", highlights: "Gateway to Serengeti and Kilimanjaro. Growing conference tourism. Strong local demand.", intent: "sale" },
    ],
  },
  {
    country: "Rwanda 🇷🇼",
    slug: "rwanda",
    areas: [
      { name: "Kiyovu, Kigali", vibe: "Government & diplomatic quarter", types: "Villas, embassies, apartments", highlights: "Most prestigious address in Kigali. Quiet, well-maintained, close to ministries.", intent: "rent" },
      { name: "Nyarutarama, Kigali", vibe: "Upmarket family suburb", types: "Villas, gated communities", highlights: "Green, hillside suburbs. Good international schools nearby. Favoured by expats.", intent: "sale" },
      { name: "Kacyiru, Kigali", vibe: "Government & growing commercial", types: "Apartments, offices, off-plan", highlights: "High off-plan activity. Newer buildings, better infrastructure. Strong yield potential.", intent: "sale" },
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
          vibe, property types and what makes each area tick.
        </p>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="space-y-14">
          {AREAS.filter((c) => (LIVE_COUNTRIES as string[]).map((x) => x.toLowerCase()).includes(c.slug)).map((country) => (
            <div key={country.slug}>
              <h2 className="font-serif text-2xl font-semibold text-primary">{country.country}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {country.areas.map((area) => (
                  <div key={area.name} className="flex flex-col rounded-2xl border border-line bg-surface-raised shadow-card overflow-hidden">
                    {"image" in area && area.image && (
                      <div className="relative h-44 w-full shrink-0">
                        <Image
                          src={area.image}
                          alt={area.name}
                          fill
                          className="object-cover"
                          sizes="(min-width: 640px) 50vw, 100vw"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-6">
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
