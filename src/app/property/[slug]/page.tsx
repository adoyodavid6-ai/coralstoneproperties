import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingBySlug, getSimilar } from "@/lib/data/listings";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { daysOnMarket, formatNumber } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { SHOW_REAL_MEDIA } from "@/lib/media";
import { Gallery } from "@/components/property/Gallery";
import { BookingWidget } from "@/components/property/BookingWidget";
import { ImmersiveGallery } from "@/components/showcase/ImmersiveGallery";
import { PropertyShowcase } from "@/components/showcase/PropertyShowcase";
import { ConversionRail } from "@/components/property/ConversionRail";
import { CostIntelligence } from "@/components/property/CostIntelligence";
import {
  LocationIntelligence,
  OffPlanProgress,
  LandToolkit,
} from "@/components/property/PropertySignals";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import {
  Pin,
  Bed,
  Bath,
  Area,
  Check,
  Sparkle,
  Flag,
  Chevron,
  Clock,
} from "@/components/ui/icons";

// Listings live in the database and change without a redeploy, so render each
// property page on demand rather than pre-building a fixed set of slugs.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getListingBySlug(slug);
  if (!p) return { title: "Property not found" };
  return {
    title: p.title,
    description: p.description.slice(0, 155),
    // While real media is off, inherit the branded OG card instead of a stock photo.
    openGraph: {
      title: p.title,
      ...(SHOW_REAL_MEDIA ? { images: [p.images[0]] } : {}),
    },
  };
}

function Fact({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-surface-muted px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs text-ink-soft">
        {icon && <span className="text-accent">{icon}</span>}
        {label}
      </p>
      <p className="figure mt-1 font-semibold text-primary">{value}</p>
    </div>
  );
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getListingBySlug(slug);
  if (!property) notFound();

  const similar = await getSimilar(property, 3);
  const dom = daysOnMarket(property.listedOn);

  // Structured data for search engines (schema.org). Price is the listing's native currency.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description,
    // Omit stock image URLs while real media is off (see src/lib/media.ts).
    ...(SHOW_REAL_MEDIA ? { image: property.images } : {}),
    category: TYPE_LABEL[property.type],
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/LimitedAvailability",
      url: `${SITE_URL}/property/${property.slug}`,
    },
    areaServed: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: property.county,
        addressRegion: property.area,
        addressCountry: property.country,
      },
    },
  };

  const facts: { icon?: React.ReactNode; label: string; value: string }[] = [
    { label: "Type", value: TYPE_LABEL[property.type] },
    { label: "Listing", value: INTENT_LABEL[property.intent] },
  ];
  if (property.beds != null && property.type !== "land")
    facts.push({ icon: <Bed className="h-3.5 w-3.5" />, label: "Bedrooms", value: property.beds === 0 ? "Studio" : String(property.beds) });
  if (property.baths != null)
    facts.push({ icon: <Bath className="h-3.5 w-3.5" />, label: "Bathrooms", value: String(property.baths) });
  if (property.size != null)
    facts.push({ icon: <Area className="h-3.5 w-3.5" />, label: "Internal size", value: `${formatNumber(property.size)} ${property.sizeUnit}` });
  if (property.plotSize != null)
    facts.push({ icon: <Area className="h-3.5 w-3.5" />, label: "Plot size", value: `${property.plotSize} ${property.plotSizeUnit}` });
  if (property.furnishing)
    facts.push({ label: "Furnishing", value: property.furnishing.replace("_", "-") });
  if (property.yearBuilt)
    facts.push({ label: "Year built", value: String(property.yearBuilt) });

  return (
    <div className="container-page py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
        <Link href="/" className="hover:text-accent">Home</Link>
        <Chevron className="h-3.5 w-3.5 -rotate-90" />
        <Link href={`/search?intent=${property.intent}`} className="hover:text-accent">
          {INTENT_LABEL[property.intent]}
        </Link>
        <Chevron className="h-3.5 w-3.5 -rotate-90" />
        <Link href={`/search?country=${encodeURIComponent(property.country)}`} className="hover:text-accent">
          {property.country}
        </Link>
        <Chevron className="h-3.5 w-3.5 -rotate-90" />
        <Link href={`/search?county=${encodeURIComponent(property.county)}`} className="hover:text-accent">
          {property.county}
        </Link>
        <Chevron className="h-3.5 w-3.5 -rotate-90" />
        <span className="text-primary">{property.area}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <Gallery property={property} />

          <ImmersiveGallery images={property.images} title={property.title} />

          {/* Title + verified strip */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {INTENT_LABEL[property.intent]} · {TYPE_LABEL[property.type]}
              </span>
              {property.status === "under_offer" && (
                <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">
                  Under offer
                </span>
              )}
            </div>
            <h1 className="display-2 mt-3 text-primary">
              {property.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-ink-soft">
              <Pin className="h-4 w-4 text-accent" />
              {property.estate ? `${property.estate}, ` : ""}
              {property.area}, {property.county} · {property.country}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <VerifiedStrip kinds={property.verified.map((v) => v.kind)} />
              <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
                <Clock className="h-4 w-4 text-accent" />
                <span className="figure">{dom}</span> days on market ·{" "}
                <span className="figure">{formatNumber(property.viewCount)}</span> views ·{" "}
                <span className="figure">{formatNumber(property.saveCount)}</span> saves
              </span>
            </div>
          </div>

          {/* Facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-animate-group>
            {facts.map((f) => (
              <Fact key={f.label} {...f} />
            ))}
          </div>

          {/* Description */}
          <section>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl text-primary">About this property</h2>
              {property.aiAssistedDescription && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                  <Sparkle className="h-3.5 w-3.5" />
                  AI-assisted, human-approved
                </span>
              )}
            </div>
            <p className="mt-3 leading-relaxed text-ink-soft">{property.description}</p>
          </section>

          {/* Decision intelligence */}
          <CostIntelligence property={property} />

          {/* Amenities */}
          <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card" data-animate>
            <h2 className="font-serif text-xl text-primary">Amenities</h2>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 text-sm text-ink-soft">
                  <Check className="h-4 w-4 shrink-0 text-verified" />
                  {a}
                </span>
              ))}
            </div>
            {property.lifestyle.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                {property.lifestyle.map((l) => (
                  <span key={l} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                    {l}
                  </span>
                ))}
              </div>
            )}
          </section>

          <OffPlanProgress property={property} />
          <LandToolkit property={property} />
          <LocationIntelligence property={property} />

          {/* Report */}
          <button className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-danger">
            <Flag className="h-4 w-4" />
            Report this listing
          </button>
        </div>

        {/* Sticky conversion rail */}
        <aside>
          <div className="lg:sticky lg:top-24">
            {property.intent === "short_let" || property.type === "venue" ? (
              <BookingWidget property={property} />
            ) : (
              <ConversionRail property={property} />
            )}
          </div>
        </aside>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow" data-animate="fade">Keep exploring</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-primary">Similar homes nearby</h2>
          <div className="mt-6">
            <PropertyShowcase properties={similar} stageHeight="clamp(320px, 46vh, 500px)" />
          </div>
        </section>
      )}
    </div>
  );
}
