"use client";

import { useState } from "react";
import { FilterPanel } from "./FilterPanel";
import { Sliders, Close } from "@/components/ui/icons";
import type { CountryOption } from "@/lib/search";

export function MobileFilters({
  locations,
}: {
  locations: CountryOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-raised px-4 py-2 text-sm font-medium text-primary"
      >
        <Sliders className="h-4 w-4 text-accent" />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <button
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="flex-1 bg-primary/40 backdrop-blur-sm"
          />
          <div className="h-full w-[88%] max-w-sm overflow-y-auto bg-surface p-5 shadow-float">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg text-primary">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-primary"
                aria-label="Close"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel locations={locations} />
          </div>
        </div>
      )}
    </div>
  );
}
