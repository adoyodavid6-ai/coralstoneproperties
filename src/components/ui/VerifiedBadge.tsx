import type { VerificationKind } from "@/lib/types";
import { VERIFICATION_META } from "@/lib/labels";
import { CheckShield } from "./icons";
import { cn } from "@/lib/cn";

/**
 * A single verified badge. Green = "safe/confirmed" and stays distinct from
 * brand plum (§4). Hover/focus reveals exactly what the badge guarantees.
 */
export function VerifiedBadge({
  kind,
  size = "md",
}: {
  kind: VerificationKind;
  size?: "sm" | "md";
}) {
  const meta = VERIFICATION_META[kind];
  return (
    <span className="group/badge relative inline-flex">
      <span
        tabIndex={0}
        role="img"
        aria-label={`${meta.label}. ${meta.guarantee}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-verified-soft font-medium text-verified ring-1 ring-verified/20",
          size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        )}
      >
        <CheckShield className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {meta.label}
      </span>
      {/* Tooltip */}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 w-60 -translate-x-1/2 rounded-xl bg-surface-dark px-3 py-2.5 text-left text-xs leading-relaxed text-white opacity-0 shadow-float ring-1 ring-white/10 transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100"
      >
        <span className="mb-0.5 block font-semibold">{meta.label}</span>
        {meta.guarantee}
      </span>
    </span>
  );
}

/** The verified strip shown on cards and PDPs. */
export function VerifiedStrip({
  kinds,
  size = "md",
  max,
  vertical = false,
}: {
  kinds: VerificationKind[];
  size?: "sm" | "md";
  max?: number;
  /** Stack badges one above the other instead of wrapping in a row. */
  vertical?: boolean;
}) {
  const shown = max ? kinds.slice(0, max) : kinds;
  const rest = kinds.length - shown.length;
  return (
    <div
      className={cn(
        "flex gap-1.5",
        vertical ? "flex-col items-start" : "flex-wrap items-center",
      )}
    >
      {shown.map((k) => (
        <VerifiedBadge key={k} kind={k} size={size} />
      ))}
      {rest > 0 && (
        <span className="text-xs font-medium text-ink-soft">+{rest} more</span>
      )}
    </div>
  );
}
