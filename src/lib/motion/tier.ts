"use client";

/**
 * Motion tiers — how much spectacle a device gets.
 *  - "off":  user asked for reduced motion, or is saving data → static site.
 *  - "lite": mid/low-end touch device → reveals only, no WebGL, no cursor.
 *  - "full": everything — Lenis, choreography, Three.js hero, custom cursor.
 */
export type MotionTier = "full" | "lite" | "off";

type NetworkInformation = { saveData?: boolean };

export function getMotionTier(): MotionTier {
  if (typeof window === "undefined") return "off"; // SSR: render static

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return "off";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const lowEnd = (memory != null && memory <= 4) || (cores != null && cores <= 4);
  if (coarse && lowEnd) return "lite";

  return "full";
}
