import Link from "next/link";
import type { Property } from "@/lib/types";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { relativeDays, daysOnMarket, formatNumber } from "@/lib/format";
import { SmartImage } from "./SmartImage";
import { SaveButton } from "./SaveButton";
import { CompareButton } from "./CompareButton";
import { VerifiedBadge } from "./VerifiedBadge";
import { Price } from "./Price";
import { Bed, Bath, Area, Pin, Camera, Users } from "./icons";
import { SHOW_REAL_MEDIA } from "@/lib/media";
import { cn } from "@/lib/cn";

function Stat({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <span className="text-accent">{icon}</span>
      <span className="figure text-[13px] text-primary">{children}</span>
    </span>
  );
}

export function PropertyCard({
  property,
  priority,
}: {
  property: Property;
  priority?: boolean;
}) {
  const isNew = daysOnMarket(property.listedOn) <= 7;
  const reduced = Boolean(property.previousPrice);
  // Card shows only the two headline guarantees — Title on top, Listing below —
  // each on its own line. Keeps the card scannable instead of a busy pill cluster;
  // the full set of verifications lives on the property page.
  const cardBadges = (["title", "listing"] as const).filter((k) =>
    property.verified.some((v) => v.kind === k),
  );

  return (
    <article className="group card-underlay relative z-0 flex flex-col rounded-xl border border-line bg-surface-raised shadow-card transition-shadow hover:z-[30] hover:shadow-float">
      <Link
        href={`/property/${property.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-t-xl"
        aria-label={property.title}
      >
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          <SmartImage
            src={property.images[0]}
            alt={property.title}
            priority={priority}
            placeholderLabel="Photo coming soon"
          />
        </div>

        {/* Top overlays */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {property.boostTier && (
              <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {property.boostTier === "spotlight" ? "Spotlight" : "Featured"}
              </span>
            )}
            {property.status === "under_offer" && (
              <span className="rounded-full bg-warning px-2.5 py-1 text-[11px] font-semibold text-white">
                Under offer
              </span>
            )}
            {isNew && property.status === "active" && (
              <span className="rounded-full bg-accent/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                New
              </span>
            )}
            {reduced && (
              <span className="rounded-full bg-verified px-2.5 py-1 text-[11px] font-semibold text-white">
                Price reduced
              </span>
            )}
          </div>
          <SaveButton id={property.id} />
        </div>

        {/* Media affordances + intent, bottom */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent p-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary backdrop-blur">
            {INTENT_LABEL[property.intent]} · {TYPE_LABEL[property.type]}
          </span>
          {SHOW_REAL_MEDIA && (
            <div className="flex items-center gap-2 text-white">
              <span className="inline-flex items-center gap-1 text-[11px]">
                <Camera className="h-3.5 w-3.5" />
                {property.images.length}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <Price property={property} className="text-xl font-semibold text-primary" />
          <span className="text-xs text-ink-soft">{relativeDays(property.listedOn)}</span>
        </div>

        <Link href={`/property/${property.slug}`}>
          <h3 className="font-serif text-lg leading-snug text-primary hover:text-accent">
            {property.title}
          </h3>
        </Link>

        <p className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <Pin className="h-4 w-4 text-accent" />
          {property.estate ? `${property.estate}, ` : ""}
          {property.area}, {property.county} · {property.country}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {property.capacity != null && (
            <Stat icon={<Users className="h-4 w-4" />}>
              {formatNumber(property.capacity)} guests
            </Stat>
          )}
          {property.beds != null && property.type !== "land" && (
            <Stat icon={<Bed className="h-4 w-4" />}>
              {property.beds === 0 ? "Studio" : property.beds}
            </Stat>
          )}
          {property.baths != null && (
            <Stat icon={<Bath className="h-4 w-4" />}>{property.baths}</Stat>
          )}
          {property.size != null && (
            <Stat icon={<Area className="h-4 w-4" />}>
              {formatNumber(property.size)} {property.sizeUnit}
            </Stat>
          )}
          {property.type === "land" && property.plotSize != null && (
            <Stat icon={<Area className="h-4 w-4" />}>
              {property.plotSize} {property.plotSizeUnit}
            </Stat>
          )}
        </div>

        <div className={cn("mt-auto flex flex-col gap-3 pt-2")}>
          {cardBadges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {cardBadges.map((k) => (
                <VerifiedBadge key={k} kind={k} size="sm" />
              ))}
            </div>
          )}
          <div className="flex items-center justify-end">
            <CompareButton id={property.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
