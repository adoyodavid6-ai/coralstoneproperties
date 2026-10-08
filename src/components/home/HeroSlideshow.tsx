"use client";

import { useEffect, useState } from "react";

import { useMotion } from "@/lib/motion/MotionProvider";

/**
 * Hero background that gently crossfades ("flips") through a set of verified
 * property photos. Replaces the old single looping video.
 *
 * - All frames live in `/media/hero/hero-NN.webp` (1920-wide, ~200-400KB each).
 * - The first frame paints instantly (SSR + priority); the rest of the stack
 *   only mounts after the browser is idle, so the crossfade never competes
 *   with the critical first paint.
 * - Reduced-motion / data-saver visitors get the first frame as a static still.
 */
const COUNT = 12;
const IMAGES = Array.from(
  { length: COUNT },
  (_, i) => `/media/hero/hero-${String(i + 1).padStart(2, "0")}.webp`,
);

// How long each photo holds before flipping, and how long the crossfade runs.
const HOLD_MS = 5000;
const FADE_MS = 1200;

export function HeroSlideshow({ className = "" }: { className?: string }) {
  const { tier } = useMotion();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);

  // Defer the full image stack until idle — first paint only waits on frame 1.
  useEffect(() => {
    if (tier === "off") return;
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, [tier]);

  // Advance to the next photo on an interval once the stack is mounted.
  useEffect(() => {
    if (!ready || tier === "off") return;
    const id = setInterval(() => setActive((i) => (i + 1) % COUNT), HOLD_MS);
    return () => clearInterval(id);
  }, [ready, tier]);

  // Reduced motion / save-data, the SSR pass, and the pre-idle window all get
  // the first still only — so first paint never waits on the full set.
  if (tier === "off" || !ready) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={IMAGES[0]}
        alt=""
        aria-hidden
        className={`h-full w-full object-cover ${className}`}
        fetchPriority="high"
      />
    );
  }

  return (
    <div aria-hidden className="relative h-full w-full">
      {IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${className}`}
          style={{ opacity: i === active ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
        />
      ))}
    </div>
  );
}
