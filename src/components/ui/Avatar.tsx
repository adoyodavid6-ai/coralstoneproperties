import { SHOW_REAL_MEDIA } from "@/lib/media";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Fills its (relatively positioned, usually round) parent. Renders the real
 * headshot when real media is on, otherwise a branded initials monogram — so
 * agent cards never show a stock/placeholder photo.
 */
export function Avatar({
  name,
  src,
  sizes,
  className,
}: {
  name: string;
  src?: string;
  sizes?: string;
  className?: string;
}) {
  if (SHOW_REAL_MEDIA && src) {
    return <SmartImage src={src} alt={name} sizes={sizes} />;
  }
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center bg-accent-soft text-sm font-semibold text-accent",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
