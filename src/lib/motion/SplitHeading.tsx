"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "./gsap";
import { useMotion } from "./MotionProvider";

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  children: React.ReactNode;
};

/**
 * Cinematic line-mask reveal for headings. SplitText (free since GSAP 3.13)
 * splits into lines with an overflow mask; each line rises into view on
 * scroll. Non-full tiers render the heading untouched.
 */
export function SplitHeading({ as: Tag = "h2", className, children }: Props) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      if (tier !== "full" || !ref.current) return;
      const split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true, // re-splits when fonts finish loading / on resize
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.08,
            scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
          }),
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [tier] },
  );

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
