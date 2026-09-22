import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { FilterPanel } from "@/components/search/FilterPanel";
import { MobileFilters } from "@/components/search/MobileFilters";
import { SortSelect } from "@/components/search/SortSelect";
import { ResultCount } from "@/components/search/ResultCount";
import { SearchBar } from "@/components/search/SearchBar";
import { SaveSearch } from "@/components/search/SaveSearch";
import { Pagination } from "@/components/search/Pagination";
import { SearchViewToggle } from "@/components/search/SearchViewToggle";
import { parseFilters, searchProperties, locationOptions } from "@/lib/search";
import type { ListingIntent } from "@/lib/types";
import { Search as SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Kenya is live; the rest are on the roadmap (see src/lib/countries.ts).
const SALE_COUNTRIES = [
  { label: "All", country: undefined, flag: "" },
  { label: "Kenya", country: "Kenya", flag: "🇰🇪" },
  { label: "Uganda", country: "Uganda", flag: "🇺🇬", comingSoon: true },
  { label: "Tanzania", country: "Tanzania", flag: "🇹🇿", comingSoon: true },
  { label: "Rwanda", country: "Rwanda", flag: "🇷🇼", comingSoon: true },
];

export const metadata: Metadata = {
  title: "Search verified properties",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const results = searchProperties(filters);
  const locations = locationOptions();
  const q = typeof sp.q === "string" ? sp.q : "";
  const intent = (typeof sp.intent === "string" ? sp.intent : "sale") as
    | ListingIntent
    | "all";

  // ---- Pagination ----
  const PAGE_SIZE = 9;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageResults = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
      else if (v != null) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  return (
    <div className="container-page py-8">
      {/* Editorial header */}
      <header className="mb-6">
        <p className="eyebrow">Verified search</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-primary sm:text-4xl">
          {q ? (
            <>
              Results for <span className="italic text-accent">&ldquo;{q}&rdquo;</span>
            </>
          ) : (
            "Every listing, checked."
          )}
        </h1>
      </header>

      {/* Search bar row */}
      <div className="mb-6">
        <SearchBar variant="compact" defaultQ={q} defaultIntent={intent} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
            <FilterPanel locations={locations} />
          </div>
        </aside>

        <section>
          {/* Country tabs — only when browsing for sale */}
          {intent === "sale" && (
            <div className="mb-5 flex flex-wrap gap-2">
              {SALE_COUNTRIES.map(({ label, country: c, flag, comingSoon }) => {
                if (comingSoon) {
                  return (
                    <span
                      key={label}
                      aria-disabled
                      title="Coming soon"
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-surface-raised px-4 py-1.5 text-sm font-medium text-ink-soft/60"
                    >
                      {flag && <span className="grayscale">{flag}</span>}
                      {label}
                      <span className="ml-0.5 rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-soft">
                        Soon
                      </span>
                    </span>
                  );
                }
                const params = new URLSearchParams();
                for (const [k, v] of Object.entries(sp)) {
                  if (k === "country" || k === "page") continue;
                  if (Array.isArray(v)) v.forEach((x) => params.append(k, x));
                  else if (v != null) params.set(k, v);
                }
                if (c) params.set("country", c);
                const active = c ? filters.country === c : !filters.country;
                return (
                  <Link
                    key={label}
                    href={`/search?${params.toString()}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-white"
                        : "border border-line-strong bg-surface-raised text-ink-soft hover:border-accent hover:text-accent",
                    )}
                  >
                    {flag && <span>{flag}</span>}
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Results toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <MobileFilters locations={locations} />
              <ResultCount count={results.length} />
            </div>
            <div className="flex items-center gap-2">
              <SaveSearch />
              <SortSelect />
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface-raised p-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
                <SearchIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-5 font-serif text-xl text-primary">
                No properties match those filters
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Try widening your price range or clearing a filter.
              </p>
            </div>
          ) : (
            <SearchViewToggle results={results}>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-animate-group>
                {pageResults.map((p, i) => (
                  <PropertyCard key={p.id} property={p} priority={i < 3} />
                ))}
              </div>
              <Pagination page={current} totalPages={totalPages} makeHref={makeHref} />
            </SearchViewToggle>
          )}
        </section>
      </div>
    </div>
  );
}
