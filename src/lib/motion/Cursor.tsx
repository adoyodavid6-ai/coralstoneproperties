"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";
import type { MotionTier } from "./tier";

/**
 * Custom cursor — a brand dot with a lagged follower ring that expands over
 * interactive elements and shows "View" over property cards
 * (data-cursor="view"). The native cursor is never hidden; this is flair,
 * not a replacement. Renders null until mounted on a fine-pointer device —
 * the hydration-mismatch guard.
 */
export function Cursor({ tier }: { tier: MotionTier | null }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Post-hydration pointer detection — the SSR render is always null.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(tier === "full" && window.matchMedia("(pointer: fine)").matches);
  }, [tier]);

  if (!active) return null;
  return <CursorInner />;
}

function CursorInner() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const view = target?.closest?.('[data-cursor="view"]');
      const interactive = target?.closest?.("a, button, [role='button'], input, select, textarea, [data-cursor]");
      label.textContent = view ? "View" : "";
      gsap.to(ring, {
        scale: view ? 2.8 : interactive ? 1.55 : 1,
        backgroundColor: view ? "rgba(255, 133, 89, 0.15)" : "rgba(255, 133, 89, 0)",
        duration: 0.3,
      });
      gsap.to(dot, { scale: view ? 0 : 1, duration: 0.3 });
    };

    const out = () => {
      shown = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25 });
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", out);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", out);
    };
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ringRef}
        className="fixed left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-accent/50"
      >
        <span ref={labelRef} className="text-[9px] font-medium uppercase tracking-widest text-ink" />
      </div>
      <div ref={dotRef} className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-accent" />
    </div>
  );
}
