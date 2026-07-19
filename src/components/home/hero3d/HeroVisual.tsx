"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState } from "react";
import { useMotion } from "@/lib/motion/MotionProvider";
import { HeroPoster } from "./HeroPoster";

// Three.js lives ONLY in this lazy chunk — never in shared/first-load JS.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <PosterFrame />,
});

function PosterFrame() {
  return (
    <div className="grid h-full w-full place-items-center">
      <HeroPoster className="w-full max-w-md drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]" />
    </div>
  );
}

/** Catches any WebGL/runtime failure in the scene and falls back to the poster. */
class SceneBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <PosterFrame /> : this.props.children;
  }
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Tier gate for the hero visual: full → WebGL scene, everything else → the
 * isometric poster. SSR renders the poster so there is always a first frame.
 */
export function HeroVisual() {
  const { tier } = useMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    // WebGL probing needs a real browser canvas — client-only, post-hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  if (tier !== "full" || webgl !== true) return <PosterFrame />;

  return (
    <SceneBoundary>
      <HeroScene />
    </SceneBoundary>
  );
}
