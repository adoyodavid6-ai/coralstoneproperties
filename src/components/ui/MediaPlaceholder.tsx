import { cn } from "@/lib/cn";

/**
 * Branded stand-in shown wherever real photography isn't available yet.
 * Fills its (relatively positioned) parent, so it drops straight into the same
 * slots a photo would occupy. Pass `label` on large surfaces (cards, gallery,
 * hero); omit it on small thumbnails, which show the mark alone.
 */
export function MediaPlaceholder({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden bg-surface-muted text-ink-soft/60",
        className,
      )}
    >
      {/* faint brand wash for a little depth */}
      <span
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(135deg, var(--color-surface-muted) 0%, var(--color-surface) 100%)",
        }}
      />
      {/* image glyph — reads as "photo" at any size */}
      <svg
        viewBox="0 0 24 24"
        className="relative h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="M21 15l-4.5-4.5L6 21" />
      </svg>
      {label && (
        <span className="relative text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      )}
    </span>
  );
}
