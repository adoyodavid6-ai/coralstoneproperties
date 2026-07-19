"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { getMotionTier, type MotionTier } from "./tier";
import { ScrollChoreographer } from "./ScrollChoreographer";
import { Cursor } from "./Cursor";

type MotionContextValue = {
  /** null until the tier has been detected on the client. */
  tier: MotionTier | null;
  /** Pause/resume Lenis smooth scroll (e.g. while a lightbox is open). */
  stopScroll: () => void;
  startScroll: () => void;
};

const MotionContext = createContext<MotionContextValue>({
  tier: null,
  stopScroll: () => {},
  startScroll: () => {},
});

export const useMotion = () => useContext(MotionContext);

/**
 * Site-wide motion shell: detects the device's motion tier, runs Lenis smooth
 * scroll bridged into GSAP's ticker, and mounts the scroll choreographer +
 * custom cursor. Children stay server-rendered (passed through untouched).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<MotionTier | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Client-only capability detection — must run once after hydration so the
    // server and first client render agree (both see tier=null → static).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTier(getMotionTier());
  }, []);

  useEffect(() => {
    if (tier !== "full") return;

    // Lenis scrolls the real window (position: sticky keeps working) while
    // GSAP's ticker drives its raf so ScrollTrigger and Lenis share one clock.
    const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [tier]);

  return (
    <MotionContext.Provider
      value={{
        tier,
        stopScroll: () => lenisRef.current?.stop(),
        startScroll: () => lenisRef.current?.start(),
      }}
    >
      {children}
      {/* useSearchParams inside — Next requires a Suspense boundary in layout. */}
      <Suspense fallback={null}>
        <ScrollChoreographer tier={tier} />
      </Suspense>
      <Cursor tier={tier} />
    </MotionContext.Provider>
  );
}
