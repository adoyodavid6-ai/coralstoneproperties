"use client";

import { useCompare } from "@/lib/compare/CompareProvider";
import { cn } from "@/lib/cn";

/** Small toggle to add/remove a listing from the compare tray. */
export function CompareButton({ id }: { id: string }) {
  const { has, toggle, ids, max } = useCompare();
  const active = has(id);
  const full = !active && ids.length >= max;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      disabled={full}
      aria-pressed={active}
      title={full ? `Compare up to ${max} at a time` : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-line-strong text-ink-soft hover:border-accent hover:text-accent",
        full && "cursor-not-allowed opacity-40 hover:border-line-strong hover:text-ink-soft",
      )}
    >
      {active ? "Comparing" : "Compare"}
    </button>
  );
}
