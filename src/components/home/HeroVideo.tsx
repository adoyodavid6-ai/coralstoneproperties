"use client";

import { useCallback, useEffect, useRef } from "react";

import { useMotion } from "@/lib/motion/MotionProvider";

/**
 * Cinematic background video for the home hero (Higgsfield render of the
 * poolside villa at golden hour).
 *
 * - Self-hosted from `/media/coralstone-hero.mp4`.
 * - The poster frame gives an instant first paint and a static image for
 *   reduced-motion / data-saver visitors.
 * - Muted + playsInline are required for autoplay on iOS and Chrome.
 * - Instead of the native `loop` (which hard-cuts from the last frame back to
 *   the first), two stacked copies crossfade into each other at the loop
 *   point so the restart is invisible.
 */
const POSTER = "/media/coralstone-hero-poster.jpg";
const SRC = "/media/coralstone-hero.mp4";

// How long (seconds) the outgoing/incoming clips overlap while fading. Kept
// short so the "double exposure" during the blend stays subtle.
const CROSSFADE = 1;

export function HeroVideo({ className = "" }: { className?: string }) {
  const { tier } = useMotion();

  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  // Which element is currently the "front" (fully opaque, playing to its end).
  const frontRef = useRef<"a" | "b">("a");
  const transitioningRef = useRef(false);

  const handleTimeUpdate = useCallback(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;

    const front = frontRef.current === "a" ? a : b;
    const back = frontRef.current === "a" ? b : a;

    const duration = front.duration;
    if (!Number.isFinite(duration) || duration <= CROSSFADE) return;

    const remaining = duration - front.currentTime;

    // Approaching the end: kick off the incoming clip and start the blend.
    if (!transitioningRef.current && remaining <= CROSSFADE) {
      transitioningRef.current = true;
      back.currentTime = 0;
      void back.play();
    }

    if (transitioningRef.current) {
      // Linear crossfade driven by how far into the overlap we are.
      const progress = Math.min(1, Math.max(0, (CROSSFADE - remaining) / CROSSFADE));
      front.style.opacity = String(1 - progress);
      back.style.opacity = String(progress);

      if (progress >= 1) {
        // Handoff complete: the incoming clip is now the front. Reset the old
        // front so it's primed to become the next incoming clip.
        transitioningRef.current = false;
        front.pause();
        front.currentTime = 0;
        front.style.opacity = "0";
        back.style.opacity = "1";
        frontRef.current = frontRef.current === "a" ? "b" : "a";
      }
    }
  }, []);

  useEffect(() => {
    if (tier === "off") return;
    const a = aRef.current;
    if (a) void a.play();
  }, [tier]);

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

  const videoClass = `absolute inset-0 h-full w-full object-cover transition-opacity ${className}`;

  return (
    <div aria-hidden className="relative h-full w-full">
      <video
        ref={aRef}
        className={videoClass}
        style={{ opacity: 1 }}
        poster={POSTER}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={SRC} type="video/mp4" />
      </video>
      <video
        ref={bRef}
        className={videoClass}
        style={{ opacity: 0 }}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src={SRC} type="video/mp4" />
      </video>
    </div>
  );
}
