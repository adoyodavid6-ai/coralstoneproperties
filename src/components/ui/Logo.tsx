import Link from "next/link";
import { cn } from "@/lib/cn";

export type LogoVariant = "full-light" | "full-dark" | "stacked" | "emblem" | "mono";

/**
 * CoralStone emblem — a cut coral gemstone in a rounded-square badge.
 * The facets read as a precious cut "stone"; premium, warm, and ownable.
 * Colours are passed in (tokens only) so one mark serves every variant.
 */
export function LogoMark({
  size = 40,
  badge,
  stroke,
  ring = false,
  className,
}: {
  size?: number;
  /** Badge fill colour (CSS value / token). */
  badge: string;
  /** Anchor stroke colour (CSS value / token). */
  stroke: string;
  /** Draw a faint rose edge so the badge reads on dark surfaces. */
  ring?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="CoralStones Properties"
      className={className}
    >
      <rect
        x="1.25"
        y="1.25"
        width="45.5"
        height="45.5"
        rx="12"
        fill={badge}
        stroke="var(--color-rose)"
        strokeOpacity={ring ? 0.4 : 0}
        strokeWidth={1.5}
      />
      {/* Subtle coral crown fill — gives the cut stone a touch of dimension */}
      <path d="M15.5 18.5 L32.5 18.5 L24 23.8 Z" fill={stroke} fillOpacity={0.18} />
      <g stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Gemstone outline: table, girdle corners, culet */}
        <path d="M15.5 18.5 L32.5 18.5 L35.5 23.8 L24 35.8 L12.5 23.8 Z" />
        {/* Girdle */}
        <path d="M12.5 23.8 L35.5 23.8" />
        {/* Crown table facets */}
        <path d="M18.8 23.8 L24 18.5 L29.2 23.8" />
        {/* Facet chains from crown down to the culet */}
        <path d="M15.5 18.5 L18.8 23.8 L24 35.8" />
        <path d="M32.5 18.5 L29.2 23.8 L24 35.8" />
      </g>
    </svg>
  );
}

export function Logo({
  href = "/",
  variant = "full-light",
  size = 40,
  monoTone = "ink",
}: {
  href?: string;
  variant?: LogoVariant;
  size?: number;
  /** Only used by variant="mono": render the whole mark in ink (navy) or paper (white). */
  monoTone?: "ink" | "paper";
}) {
  const dark = variant === "full-dark";

  // ---- mono: single-colour outline mark for print / edge cases ----
  if (variant === "mono") {
    const c = monoTone === "paper" ? "var(--color-surface-raised)" : "var(--color-primary)";
    const textCls = monoTone === "paper" ? "text-white" : "text-primary";
    return (
      <Link href={href} aria-label="CoralStones Properties — home" className="inline-flex items-center gap-2.5">
        <MonoMark size={size} colour={c} />
        <span className="leading-tight">
          <span className={cn("block font-serif text-[19px] font-semibold tracking-tight", textCls)}>
            CoralStones
          </span>
          <span className={cn("-mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em] opacity-70", textCls)}>
            Properties
          </span>
        </span>
      </Link>
    );
  }

  // Emblem is always the dark brand badge with a coral gemstone (coral-on-dark is the legible combo).
  const mark = (
    <LogoMark size={size} badge="var(--color-surface-dark)" stroke="var(--color-rose)" ring={dark} />
  );

  if (variant === "emblem") {
    return (
      <Link href={href} aria-label="CoralStones Properties — home" className="inline-flex">
        {mark}
      </Link>
    );
  }

  // Wordmark colours obey the contrast law: rose text only on dark; muted ink on light.
  const coralText = dark ? "text-white" : "text-primary";
  const stoneText = dark ? "text-rose" : "text-ink-soft";
  const subText = dark ? "text-rose/80" : "text-accent";

  return (
    <Link
      href={href}
      aria-label="CoralStones Properties — home"
      className={cn(
        "inline-flex items-center gap-2.5",
        variant === "stacked" && "flex-col gap-2 text-center",
      )}
    >
      {mark}
      <span className="leading-tight">
        <span className="block font-serif text-[19px] font-semibold tracking-tight">
          <span className={coralText}>Coral</span>
          <span className={cn("font-medium", stoneText)}>Stones</span>
        </span>
        <span className={cn("-mt-0.5 block text-[10px] font-medium uppercase tracking-[0.2em]", subText)}>
          Properties
        </span>
      </span>
    </Link>
  );
}

/** Single-colour outline emblem for the mono variant. */
function MonoMark({ size, colour }: { size: number; colour: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" role="img" aria-label="CoralStones Properties">
      <rect x="2" y="2" width="44" height="44" rx="11" fill="none" stroke={colour} strokeWidth={2} />
      <g stroke={colour} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M15.5 18.5 L32.5 18.5 L35.5 23.8 L24 35.8 L12.5 23.8 Z" />
        <path d="M12.5 23.8 L35.5 23.8" />
        <path d="M18.8 23.8 L24 18.5 L29.2 23.8" />
        <path d="M15.5 18.5 L18.8 23.8 L24 35.8" />
        <path d="M32.5 18.5 L29.2 23.8 L24 35.8" />
      </g>
    </svg>
  );
}
