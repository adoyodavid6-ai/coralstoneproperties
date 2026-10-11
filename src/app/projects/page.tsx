import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getActiveListings } from "@/lib/data/listings";
import type { Agent, Property } from "@/lib/types";
import { Trend, CheckShield, Calendar, Search as SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Developer projects",
  description:
    "Ongoing developments marketed by CoralStones — buy or rent in verified projects, from off-plan launches to ready-to-move-in homes.",
};

/** A listing belongs to a developer project when it is off-plan or carries a verified-developer badge. */
function isProject(p: Property): boolean {
  return p.type === "off_plan" || p.verified.some((v) => v.kind === "developer");
}

type Stage = "off_plan" | "completing" | "ready";

function stageOf(p: Property): Stage {
  if (p.completionPercent == null || p.completionPercent >= 100) return "ready";
  return p.completionPercent >= 60 ? "completing" : "off_plan";
}

const INTENT_TABS = [
  { label: "All", intent: undefined },
  { label: "Buy", intent: "sale" },
  { label: "Rent", intent: "rent" },
] as const;

const STAGE_TABS: { label: string; stage?: Stage }[] = [
  { label: "Any stage" },
  { label: "Off-plan launches", stage: "off_plan" },
  { label: "Completing soon", stage: "completing" },
  { label: "Ready to move in", stage: "ready" },
];

const WHY = [
  {
    icon: CheckShield,
    t: "Verified developers",
    p: "Every developer is checked for registration, approvals and title before a project goes live.",
  },
  {
    icon: Calendar,
    t: "Track construction",
    p: "Completion progress and handover dates are shown on each listing and updated as milestones land.",
  },
  {
    icon: Trend,
    t: "Staged payment plans",
    p: "Reserve at launch pricing and pay in instalments tied to construction — ideal for diaspora buyers.",
  },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const intent = one(sp.intent);
  const stage = one(sp.stage) as Stage | undefined;
  const developerId = one(sp.developer);

  const projects = (await getActiveListings()).filter(isProject);

  // One showcase card per developer, with their live project count.
  const developers = new Map<string, { agent: Agent; count: number; cover?: string }>();
  for (const p of projects) {
    const d = developers.get(p.agent.id);
    if (d) d.count++;
    else developers.set(p.agent.id, { agent: p.agent, count: 1, cover: p.images[0] });
  }
  const activeDeveloper = developerId ? developers.get(developerId)?.agent : undefined;

  const results = projects.filter(
    (p) =>
      (!intent || p.intent === intent) &&
      (!stage || stageOf(p) === stage) &&
      (!developerId || p.agent.id === developerId),
  );

  const href = (next: { intent?: string; stage?: string; developer?: string }) => {
    const params = new URLSearchParams();
    const merged = { intent, stage, developer: developerId, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-accent bg-accent text-white"
        : "border-line text-ink-soft hover:border-accent hover:text-accent",
    );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-surface-dark px-6 pb-14 pt-20 text-center sm:pb-16 sm:pt-24">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow text-white/60">Developer projects</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-white sm:text-5xl">
            {activeDeveloper ? activeDeveloper.name : "Ongoing developments across East Africa"}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/75">
            {activeDeveloper
              ? `Every live project from ${activeDeveloper.agency || activeDeveloper.name}, verified by CoralStones.`
              : "Buy or rent in verified projects — from off-plan launches at early-bird prices to completed homes ready to move into."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="#listings" size="lg" variant="coral">
              Browse projects
            </ButtonLink>
            <ButtonLink
              href="/pricing#developers"
              size="lg"
              className="bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              Market your project
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────────────────────────── */}
      <section id="listings" className="container-page scroll-mt-28 py-12 sm:py-16">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {INTENT_TABS.map((t) => (
              <Link key={t.label} href={href({ intent: t.intent })} className={chip(intent === t.intent)}>
                {t.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {STAGE_TABS.map((t) => (
              <Link key={t.label} href={href({ stage: t.stage })} className={chip(stage === t.stage)}>
                {t.label}
              </Link>
            ))}
          </div>
          {activeDeveloper && (
            <p className="text-sm text-ink-soft">
              Showing projects by <span className="font-semibold text-primary">{activeDeveloper.name}</span> ·{" "}
              <Link href={href({ developer: "" })} className="font-semibold text-accent hover:brightness-90">
                Show all developers
              </Link>
            </p>
          )}
        </div>

        <p className="mt-6 text-sm text-ink-soft">
          <span className="figure font-semibold text-primary">{results.length}</span>{" "}
          {results.length === 1 ? "project listing" : "project listings"}
        </p>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-animate-group>
            {results.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
              <SearchIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-serif text-xl text-primary">No projects match yet</h2>
            <p className="mt-2 text-sm text-ink-soft">
              New developments are added regularly. Clear a filter, or ask us about upcoming launches.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/projects" variant="outline">
                Clear filters
              </ButtonLink>
              <ButtonLink href="/contact" variant="coral">
                Ask about upcoming launches
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      {/* ── Developer showcases ──────────────────────────────────────────── */}
      <section id="developers" className="scroll-mt-28 bg-surface-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Developer showcases</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-primary sm:text-4xl">
              Developers we market
            </h2>
            <p className="mt-3 text-[15px] text-ink-soft">
              Each partner gets a branded project page for all their units, backed by a CoralStones
              marketing campaign.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...developers.values()].map(({ agent, count, cover }) => (
              <Link
                key={agent.id}
                href={`${href({ developer: agent.id, intent: "", stage: "" })}#listings`}
                className="group overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-card transition-shadow hover:shadow-float"
              >
                {cover && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <SmartImage
                      src={cover}
                      alt={agent.name}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <p className="font-serif text-lg font-semibold text-primary">{agent.name}</p>
                  {agent.agency && agent.agency !== agent.name && (
                    <p className="mt-0.5 text-sm text-ink-soft">{agent.agency}</p>
                  )}
                  <p className="mt-3 text-sm font-semibold text-accent">
                    {count} live {count === 1 ? "listing" : "listings"} →
                  </p>
                </div>
              </Link>
            ))}

            {/* Pitch tile — links to the developer pricing on /pricing */}
            <Link
              href="/pricing#developers"
              className="flex flex-col justify-between rounded-2xl border border-dashed border-accent/60 bg-surface-raised p-6 transition-colors hover:bg-accent-soft"
            >
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Trend className="h-6 w-6" />
                </span>
                <p className="mt-4 font-serif text-lg font-semibold text-primary">Are you a developer?</p>
                <p className="mt-2 text-sm text-ink-soft">
                  Get a branded project page and a full marketing campaign. From KSh 50,000 / mo.
                </p>
              </div>
              <p className="mt-5 text-sm font-semibold text-accent">See developer pricing →</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why buy into a project ───────────────────────────────────────── */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {WHY.map(({ icon: Icon, t, p }) => (
            <div key={t} className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold text-primary">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/mortgage" variant="outline">
            Mortgage calculator
          </ButtonLink>
          <ButtonLink href="/diaspora" variant="outline">
            Buying from the diaspora
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
