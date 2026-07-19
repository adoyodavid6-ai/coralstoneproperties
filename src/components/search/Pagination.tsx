import Link from "next/link";
import { Chevron } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

function Arrow({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls =
    "grid h-9 w-9 place-items-center rounded-lg border border-line-strong text-primary transition-colors hover:border-accent";
  if (disabled) {
    return (
      <span aria-disabled className={cn(cls, "cursor-not-allowed opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  );
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      <Arrow href={makeHref(page - 1)} disabled={page <= 1} label="Previous page">
        <Chevron className="h-4 w-4 rotate-90" />
      </Arrow>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "figure grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm transition-colors",
            p === page
              ? "bg-ink-black text-white"
              : "border border-line-strong text-primary hover:border-accent",
          )}
        >
          {p}
        </Link>
      ))}
      <Arrow href={makeHref(page + 1)} disabled={page >= totalPages} label="Next page">
        <Chevron className="h-4 w-4 -rotate-90" />
      </Arrow>
    </nav>
  );
}
