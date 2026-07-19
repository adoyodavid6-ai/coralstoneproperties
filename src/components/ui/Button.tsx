import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "coral" | "outline" | "ghost" | "verified" | "inverse";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  // Primary buttons use near-black ink
  primary:
    "bg-ink-black text-white hover:bg-primary-hover shadow-card focus-visible:outline-ring",
  // Secondary actions use the brand slate-blue accent
  accent: "bg-accent text-white hover:bg-accent-hover shadow-card",
  // Coral — the warm appeal colour, for high-emphasis calls to action (dark ink reads on coral)
  coral: "bg-rose text-ink-black hover:brightness-105 shadow-card",
  outline:
    "border border-line-strong bg-surface-raised text-primary hover:border-accent hover:text-accent",
  ghost: "text-primary hover:bg-accent-soft",
  verified: "bg-verified text-white hover:brightness-95",
  // White fill for use on dark surfaces (e.g. the navy CTA band)
  inverse: "bg-white text-primary hover:bg-white/90 shadow-card",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >) {
  return (
    <Link
      href={href}
      className={cn(base, VARIANT[variant], SIZE[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
