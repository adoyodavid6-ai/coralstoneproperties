"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { useCompare } from "@/lib/compare/CompareProvider";

/** Floating glass pill shown when listings are selected for comparison. */
export function CompareBar() {
  const { ids, clear, max } = useCompare();
  const ref = useRef<HTMLDivElement>(null);
  const count = ids.length;

  // Springy enter when the bar first appears.
  useEffect(() => {
    if (count > 0 && ref.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        ref.current,
        { y: 90, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: "elastic.out(1, 0.7)" },
      );
    }
    // Only replay when going from empty → selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count > 0]);

  if (count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
      <div
        ref={ref}
        className="pointer-events-auto flex items-center gap-3 rounded-full bg-surface-raised/80 py-2 pl-5 pr-2 shadow-float ring-1 ring-line-strong backdrop-blur-xl"
      >
        <p className="text-sm text-primary">
          <span className="figure font-semibold">{count}</span> of {max} to compare
        </p>
        <button
          onClick={clear}
          className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft hover:text-primary"
        >
          Clear
        </button>
        <Link
          href="/compare"
          className="rounded-full bg-ink-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Compare {count}
        </Link>
      </div>
    </div>
  );
}
