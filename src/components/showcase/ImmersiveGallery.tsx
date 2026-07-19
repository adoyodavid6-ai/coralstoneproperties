"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { ShowcaseBoundary } from "./ShowcaseBoundary";

const GalleryStage = dynamic(() => import("./GalleryStage"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="eyebrow animate-pulse text-accent-on-dark">Loading tour…</span>
    </div>
  ),
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * PDP "walk-around" — a draggable 3D ring of this listing's own photos. Only
 * shown on WebGL-capable full-tier devices; the standard 2D gallery above
 * already serves everyone else, so this stays additive (never a regression).
 */
export function ImmersiveGallery({ images, title }: { images: string[]; title: string }) {
  const { tier } = useMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  const items = useMemo(
    () => images.map((url, i) => ({ id: `${title}-${i}`, url })),
    [images, title],
  );

  if (tier !== "full" || webgl !== true || items.length < 2) return null;

  return (
    <section data-animate="fade">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="font-serif text-lg text-primary">Take the 3D tour</h2>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          Drag to orbit the space
        </span>
      </div>
      <div className="theme-dark grain relative overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 16%, rgb(67 113 154 / 0.26), transparent 60%)",
          }}
        />
        <div className="relative h-[clamp(300px,44vh,460px)]">
          <ShowcaseBoundary fallback={null}>
            <GalleryStage items={items} />
          </ShowcaseBoundary>
        </div>
      </div>
    </section>
  );
}
