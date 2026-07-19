"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";
import { getMotionTier } from "./tier";

/**
 * Entrance-only page transition, played on every App Router navigation
 * (mounted from app/template.tsx, which remounts per route). A bone hairline
 * sweeps across the top while the page rises in. Exit animations are
 * deliberately out of scope — App Router has no stable exit-defer mechanism,
 * and this keeps back/forward, scroll restoration and streaming intact.
 */
export function TransitionShell({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (getMotionTier() === "off") return;
      const tl = gsap.timeline();
      tl.fromTo(
        sweepRef.current,
        { scaleX: 0, autoAlpha: 1, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.45, ease: "power2.inOut" },
      )
        .fromTo(
          ref.current,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", clearProps: "all" },
          0.08,
        )
        .to(sweepRef.current, { autoAlpha: 0, duration: 0.25 }, ">-0.1");
    },
    { scope: ref },
  );

  return (
    <>
      <div
        ref={sweepRef}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px bg-ink/50 opacity-0"
      />
      <div ref={ref}>{children}</div>
    </>
  );
}
