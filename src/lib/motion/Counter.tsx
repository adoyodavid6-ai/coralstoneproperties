"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";
import { useMotion } from "./MotionProvider";
import { cn } from "@/lib/cn";

/**
 * Scroll-triggered number counter in tabular mono. Server-renders the final
 * value (SEO / no-JS safe); with motion on, it counts up from 0 when scrolled
 * into view. Tier off → the static number stays.
 */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || tier === "off" || tier === null) return;
      const state = { v: 0 };
      const render = () => {
        el.textContent = `${prefix}${Math.round(state.v).toLocaleString("en-US")}${suffix}`;
      };
      gsap.to(state, {
        v: to,
        duration,
        ease: "power2.out",
        onStart: render,
        onUpdate: render,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [tier, to] },
  );

  return (
    <span ref={ref} className={cn("figure", className)}>
      {prefix}
      {to.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
