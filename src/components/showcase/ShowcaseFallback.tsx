"use client";

import type { Property } from "@/lib/types";
import { PropertyCard } from "@/components/ui/PropertyCard";

/**
 * Non-WebGL stand-in for the 3D ring: a snap-scrolling rail of real cards.
 * Served to reduced-motion / data-saver / low-end devices, so the showcase is
 * still moveable and every property stays reachable and accessible.
 */
export function ShowcaseFallback({ properties }: { properties: Property[] }) {
  return (
    <div
      className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
      style={{ scrollbarWidth: "thin" }}
    >
      {properties.map((p, i) => (
        <div key={p.id} className="w-[280px] shrink-0 snap-center sm:w-[320px]">
          <PropertyCard property={p} priority={i < 2} />
        </div>
      ))}
    </div>
  );
}
