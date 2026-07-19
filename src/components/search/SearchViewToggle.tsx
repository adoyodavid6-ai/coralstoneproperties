"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";
import { PropertyShowcase } from "@/components/showcase/PropertyShowcase";
import { Cube } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const GridIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true" className={className ?? "h-[1em] w-[1em]"}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

/**
 * Lets a searcher flip the same result set between the paginated grid (server-
 * rendered, passed as children) and the draggable 3D showcase.
 */
export function SearchViewToggle({
  results,
  children,
}: {
  results: Property[];
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"grid" | "immersive">("grid");

  const btn = (v: "grid" | "immersive", label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setView(v)}
      aria-pressed={view === v}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        view === v
          ? "bg-ink text-surface-raised"
          : "text-ink-soft hover:text-primary",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <div className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-raised p-1 shadow-card">
          {btn("grid", "Grid", <GridIcon className="h-4 w-4" />)}
          {btn("immersive", "Immersive", <Cube className="h-4 w-4" />)}
        </div>
      </div>

      {view === "grid" ? (
        children
      ) : (
        <PropertyShowcase properties={results} stageHeight="clamp(360px, 60vh, 640px)" />
      )}
    </div>
  );
}
