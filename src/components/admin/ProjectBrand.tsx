"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectBrand } from "@/lib/admin/types";
import { Check, Chevron } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
}

/** A project's logo, or its initials on the project colour when no logo is set. */
export function ProjectBrandMark({ brand, size = 40 }: { brand: ProjectBrand; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-xl ring-1 ring-black/5"
      style={{ width: size, height: size, background: brand.logo ? "#ffffff" : brand.primaryColor }}
    >
      {brand.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs and arbitrary hosts
        <img src={brand.logo} alt={`${brand.name} logo`} className="h-full w-full object-contain p-1" />
      ) : (
        <span className="font-sans font-bold" style={{ color: brand.accentColor, fontSize: size * 0.38 }}>
          {initials(brand.name)}
        </span>
      )}
    </span>
  );
}

function Swatches({ brand }: { brand: ProjectBrand }) {
  return (
    <span className="flex shrink-0 -space-x-1">
      <span className="h-4 w-4 rounded-full ring-2 ring-surface-raised" style={{ background: brand.primaryColor }} />
      <span className="h-4 w-4 rounded-full ring-2 ring-surface-raised" style={{ background: brand.accentColor }} />
    </span>
  );
}

/** Dropdown listing every onboarded project with its logo, name and colours. */
export function ProjectPicker({
  brands,
  value,
  onChange,
}: {
  brands: ProjectBrand[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = brands.find((b) => b.id === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-line-strong bg-surface-raised px-3 py-2.5 text-left transition-colors hover:border-accent"
      >
        {selected ? (
          <>
            <ProjectBrandMark brand={selected} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-primary">{selected.name}</span>
              <span className="block truncate text-xs text-ink-soft">{selected.developer || "No developer set"}</span>
            </span>
            <Swatches brand={selected} />
          </>
        ) : (
          <span className="flex-1 text-sm text-ink-soft">Select a project…</span>
        )}
        <Chevron className={cn("h-4 w-4 text-ink-soft transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Projects"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-line bg-surface-raised py-1.5 shadow-float"
        >
          {brands.length === 0 && <li className="px-4 py-3 text-sm text-ink-soft">No projects yet.</li>}
          {brands.map((b) => (
            <li key={b.id} role="option" aria-selected={b.id === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(b.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-muted",
                  b.id === value && "bg-accent-soft",
                )}
              >
                <ProjectBrandMark brand={b} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-primary">{b.name}</span>
                  <span className="block truncate text-xs text-ink-soft">{b.location || b.developer}</span>
                </span>
                <Swatches brand={b} />
                {b.id === value && <Check className="h-4 w-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
