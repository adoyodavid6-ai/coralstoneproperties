"use client";

import { useMotion } from "@/lib/motion/MotionProvider";

/**
 * Cinematic background video for the home hero (Higgsfield / Veo 3.1 render of
 * the poolside villa at golden hour).
 *
 * - Self-hosted file first (`/media/coralstone-hero.mp4`); if it is missing the
 *   browser falls through to the Higgsfield CDN copy, so the hero always plays.
 * - The poster frame is the source photo, so there is an instant first paint
 *   and a static image for reduced-motion / data-saver visitors.
 * - Muted + playsInline are required for autoplay on iOS and Chrome.
 */
const POSTER = "/media/coralstone-hero-poster.jpg";
const SOURCES = [
  "/media/coralstone-hero.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3G8eKFitMii0PqGIsT5C7eN6HXn/hf_20260926_222842_242cdca9-ba1d-4530-a741-2d7b5b72ff8f.mp4",
];

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
      {SOURCES.map((src) => (
        <source key={src} src={src} type="video/mp4" />
      ))}
    </video>
  );
}
