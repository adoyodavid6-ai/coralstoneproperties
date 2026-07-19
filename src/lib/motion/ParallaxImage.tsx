"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "./gsap";
import { useMotion } from "./MotionProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/cn";

/**
 * Scroll parallax around SmartImage — the image is oversized to 112% and
 * drifts vertically as its container crosses the viewport. Tier off → a
 * plain (still oversized but static) image.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { tier } = useMotion();

  useGSAP(
    () => {
      if (tier === "off" || tier === null || !ref.current || !innerRef.current) return;
      gsap.fromTo(
        innerRef.current,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [tier] },
  );

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div ref={innerRef} className="absolute -inset-y-[6%] inset-x-0">
        <SmartImage src={src} alt={alt} sizes={sizes} priority={priority} />
      </div>
    </div>
  );
}
