"use client";

import { useMotion } from "@/lib/motion/MotionProvider";

/**
 * Cinematic background video for the home hero (Higgsfield render of the
 * poolside villa at golden hour).
 *
 * - Self-hosted from `/media/coralstone-hero.mp4`.
 * - The poster frame gives an instant first paint and a static image for
 *   reduced-motion / data-saver visitors.
 * - Muted + playsInline are required for autoplay on iOS and Chrome.
 */
const POSTER = "/media/coralstone-hero-poster.jpg";
const SRC = "/media/coralstone-hero.mp4";

export function HeroVideo({ className = "" }: { className?: string }) {
  const { tier } = useMotion();

  // Reduced motion / save-data (and the SSR pass) get the still frame only.
  if (tier === "off") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={POSTER}
        alt=""
        aria-hidden
        className={`h-full w-full object-cover ${className}`}
        fetchPriority="high"
      />
    );
  }

  return (
    <video
      aria-hidden
      className={`h-full w-full object-cover ${className}`}
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
    >
      <source src={SRC} type="video/mp4" />
    </video>
  );
}
