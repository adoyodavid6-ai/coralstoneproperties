"use client";

import Link from "next/link";
import type { Property } from "@/lib/types";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { formatNumber } from "@/lib/format";
import { Price } from "@/components/ui/Price";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import { Bed, Bath, Area, Pin, Chevron, Users } from "@/components/ui/icons";

/**
 * Glass detail card that tracks the frontmost property on the ring — the read
 * of every figure lives here in accessible HTML, not baked into the WebGL.
 */
export function ActivePropertyPanel({
  property,
  position,
  total,
}: {
  property: Property;
  position: number;
  total: number;
}) {
  const listingVerified = property.verified
    .filter((v) => v.kind === "listing" || v.kind === "title" || v.kind === "developer")
    .map((v) => v.kind);

  return (
    <div className="rounded-2xl border border-line bg-surface-raised/70 p-5 shadow-float backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
          {INTENT_LABEL[property.intent]} · {TYPE_LABEL[property.type]}
        </span>
        <span className="figure text-[11px] text-ink-soft">
          {String(position + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <Price property={property} className="mt-3 block text-2xl font-semibold text-primary" />

      <h3 className="mt-1 text-lg font-semibold leading-snug text-primary">{property.title}</h3>

      <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <Pin className="h-4 w-4 text-accent" />
        {property.area}, {property.county} · {property.country}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
        {property.capacity != null && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-accent" />
            <span className="figure text-[13px] text-primary">
              {formatNumber(property.capacity)} guests
            </span>
          </span>
        )}
        {property.beds != null && property.type !== "land" && (
          <span className="inline-flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-accent" />
            <span className="figure text-[13px] text-primary">
              {property.beds === 0 ? "Studio" : property.beds}
            </span>
          </span>
        )}
        {property.baths != null && (
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-accent" />
            <span className="figure text-[13px] text-primary">{property.baths}</span>
          </span>
        )}
        {property.size != null && (
          <span className="inline-flex items-center gap-1.5">
            <Area className="h-4 w-4 text-accent" />
            <span className="figure text-[13px] text-primary">
              {formatNumber(property.size)} {property.sizeUnit}
            </span>
          </span>
        )}
        {property.type === "land" && property.plotSize != null && (
          <span className="inline-flex items-center gap-1.5">
            <Area className="h-4 w-4 text-accent" />
            <span className="figure text-[13px] text-primary">
              {property.plotSize} {property.plotSizeUnit}
            </span>
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {listingVerified.length > 0 && <VerifiedStrip kinds={listingVerified} size="sm" max={3} />}
        <Link
          href={`/property/${property.slug}`}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ink-black px-4 py-2 text-sm font-semibold text-white transition-[filter] hover:brightness-125"
          data-cursor="view"
        >
          View property
          <Chevron className="h-4 w-4 -rotate-90" />
        </Link>
      </div>
    </div>
  );
}
