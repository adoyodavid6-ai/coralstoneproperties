"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types";
import { useMotion } from "@/lib/motion/MotionProvider";
import { cn } from "@/lib/cn";
import type { ShowcaseGroup } from "./types";
import { ActivePropertyPanel } from "./ActivePropertyPanel";
import { ShowcaseFallback } from "./ShowcaseFallback";
import { ShowcaseBoundary } from "./ShowcaseBoundary";

// Three.js is confined to this lazily-loaded chunk — never in shared/first-load JS.
const Showcase3D = dynamic(() => import("./Showcase3D"), {
  ssr: false,
  loading: () => <StageLoading />,
});

const MAX_CARDS = 12; // keep the ring readable even when a dataset is large

function StageLoading() {
  return (
    <div className="grid h-full w-full place-items-center">
      <span className="eyebrow animate-pulse text-accent-on-dark">Loading showcase…</span>
    </div>
  );
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The reusable immersive carousel used across the site. Full-tier devices with
 * WebGL get the draggable 3D ring + synced detail panel; everyone else gets an
 * accessible snap-scroll rail. Optional filter chips swap the dataset live.
 */
export function PropertyShowcase({
  properties,
  groups,
  className,
  stageHeight = "clamp(340px, 54vh, 580px)",
}: {
  properties: Property[];
  groups?: ShowcaseGroup[];
  className?: string;
  stageHeight?: string;
}) {
  const { tier } = useMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [groupId, setGroupId] = useState(groups?.[0]?.id ?? "all");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  // Resolve the active dataset; if a chip filters too aggressively, show all.
  const list = useMemo(() => {
    const group = groups?.find((g) => g.id === groupId);
    const filtered = group ? properties.filter(group.test) : properties;
    const base = filtered.length >= 3 ? filtered : properties;
    return base.slice(0, MAX_CARDS);
  }, [properties, groups, groupId]);

  const router = useRouter();
  const onActive = useCallback((i: number) => setActiveIndex(i), []);
  const onOpen = useCallback(
    (i: number) => {
      const p = list[i];
      if (p) router.push(`/property/${p.slug}`);
    },
    [list, router],
  );

  const use3D = tier === "full" && webgl === true && list.length >= 2;
  const active = list[Math.min(activeIndex, list.length - 1)];

  return (
    <div className={cn("theme-dark", className)}>
      {groups && groups.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Showcase datasets">
          {groups.map((g) => {
            const on = g.id === groupId;
            return (
              <button
                key={g.id}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setGroupId(g.id);
                  setActiveIndex(0);
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
                  on
                    ? "border-rose bg-rose text-ink-black"
                    : "border-line text-ink-soft hover:border-rose hover:text-primary",
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      )}

      {use3D ? (
        <div
          className="grain relative overflow-hidden rounded-3xl bg-surface ring-1 ring-line"
          style={{ height: stageHeight }}
        >
          {/* Luminous brand wash — the cinematic stage glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 18%, rgb(22 66 91 / 0.28), transparent 60%)",
            }}
          />
          <ShowcaseBoundary fallback={<StageLoading />}>
            <Showcase3D properties={list} onActive={onActive} onOpen={onOpen} />
          </ShowcaseBoundary>

          {active && (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 md:right-auto md:w-[360px]">
              <div className="pointer-events-auto">
                <ActivePropertyPanel property={active} position={activeIndex} total={list.length} />
              </div>
            </div>
          )}

          <span className="pointer-events-none absolute right-5 top-5 hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft sm:flex">
            Drag to explore
          </span>
        </div>
      ) : (
        <div className="grain rounded-3xl bg-surface p-5 ring-1 ring-line">
          <ShowcaseFallback properties={list} />
        </div>
      )}
    </div>
  );
}
