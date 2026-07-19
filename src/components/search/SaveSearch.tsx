"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, Close, Chevron } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const KEY = "vpl.searches";

interface Saved {
  label: string;
  query: string;
}

function labelFor(qs: string): string {
  const p = new URLSearchParams(qs);
  const parts: string[] = [];
  if (p.get("q")) parts.push(`“${p.get("q")}”`);
  if (p.get("intent")) parts.push(p.get("intent")!);
  if (p.get("type")) parts.push(p.get("type")!);
  if (p.get("country")) parts.push(p.get("country")!);
  if (p.get("county")) parts.push(p.get("county")!);
  return parts.length ? parts.join(" · ") : "All properties";
}

/** Save the current search (URL params) to localStorage and recall it later. */
export function SaveSearch() {
  const [saved, setSaved] = useState<Saved[]>([]);
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: Saved[]) => {
    setSaved(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const save = () => {
    const query = window.location.search.replace(/^\?/, "");
    const entry: Saved = { label: labelFor(query), query };
    if (!saved.some((s) => s.query === entry.query)) {
      persist([entry, ...saved].slice(0, 8));
    }
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const removeAt = (i: number) => persist(saved.filter((_, idx) => idx !== i));

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={save}
        className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-raised px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
      >
        <Star className="h-4 w-4" />
        <span className="hidden sm:inline">{justSaved ? "Saved!" : "Save search"}</span>
      </button>

      {saved.length > 0 && (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface-raised px-3 py-2 text-sm font-medium text-primary hover:border-accent"
        >
          Saved
          <span className="figure text-xs text-ink-soft">({saved.length})</span>
          <Chevron className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      )}

      {open && saved.length > 0 && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-line bg-surface-raised p-2 shadow-float">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Saved searches
          </p>
          <ul className="mt-1 space-y-0.5">
            {saved.map((s, i) => (
              <li key={s.query} className="group flex items-center gap-1">
                <Link
                  href={`/search${s.query ? `?${s.query}` : ""}`}
                  onClick={() => setOpen(false)}
                  className="flex-1 truncate rounded-lg px-2 py-2 text-sm text-primary hover:bg-accent-soft"
                >
                  {s.label}
                </Link>
                <button
                  onClick={() => removeAt(i)}
                  aria-label="Remove saved search"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-soft hover:text-danger"
                >
                  <Close className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
