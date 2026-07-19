"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gsap, ScrollTrigger } from "./gsap";
import type { MotionTier } from "./tier";

/**
 * The server-component-friendly reveal system. Server JSX opts in with plain
 * attributes — no client wrappers needed:
 *
 *   data-animate              fade-up (default)
 *   data-animate="fade"       opacity only
 *   data-animate="scale"      scale + fade
 *   data-animate="line"       scaleX 0 → 1 (hairlines/dividers)
 *   data-animate-delay="0.2"  seconds
 *   data-animate-group        on a container: stagger its direct children
 *
 * Re-scans on every pathname/searchParams change (so freshly filtered search
 * results animate in), builds all triggers in one gsap.context and reverts it
 * on route change. Content is never hidden without JS or for crawlers — the
 * `motion-ready` class on <html> gates the CSS that hides pre-reveal elements.
 */
export function ScrollChoreographer({ tier }: { tier: MotionTier | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (tier === null) return;

    if (tier === "off") {
      document.documentElement.classList.remove("motion-ready");
      return;
    }

    // Gate CSS hiding + build triggers in the same tick — no flash window.
    document.documentElement.classList.add("motion-ready");

    const ctx = gsap.context(() => {
      const fresh = <T extends Element>(selector: string) =>
        Array.from(document.querySelectorAll<T>(selector)).filter(
          (el) => !el.hasAttribute("data-animated"),
        );

      const VARIANTS: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
        up: { from: { autoAlpha: 0, y: 28 }, to: { autoAlpha: 1, y: 0 } },
        fade: { from: { autoAlpha: 0 }, to: { autoAlpha: 1 } },
        scale: { from: { autoAlpha: 0, scale: 0.92 }, to: { autoAlpha: 1, scale: 1 } },
        line: {
          from: { scaleX: 0, transformOrigin: "left center" },
          to: { scaleX: 1 },
        },
      };

      // Grouped children — one trigger per container, staggered reveal.
      for (const group of fresh<HTMLElement>("[data-animate-group]")) {
        group.setAttribute("data-animated", "");
        const kids = Array.from(group.children) as HTMLElement[];
        if (kids.length === 0) continue;
        const variant = VARIANTS[group.getAttribute("data-animate-group") || "up"] ?? VARIANTS.up;
        gsap.fromTo(kids, variant.from, {
          ...variant.to,
          duration: 0.9,
          stagger: 0.09,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
        });
      }

      // Individual elements.
      for (const el of fresh<HTMLElement>("[data-animate]")) {
        el.setAttribute("data-animated", "");
        const variant = VARIANTS[el.getAttribute("data-animate") || "up"] ?? VARIANTS.up;
        const delay = parseFloat(el.getAttribute("data-animate-delay") || "0") || 0;
        gsap.fromTo(el, variant.from, {
          ...variant.to,
          duration: 0.9,
          delay,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      }
    });

    // Recalculate trigger positions once images/layout settle.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const idle = window.setTimeout(() => ScrollTrigger.refresh(), 700);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(idle);
      ctx.revert();
    };
  }, [routeKey, tier]);

  return null;
}
