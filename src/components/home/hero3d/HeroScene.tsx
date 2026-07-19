"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Terrain } from "./Terrain";
import { Buildings } from "./Buildings";
import { ParticleField } from "./ParticleField";
import { CameraRig } from "./CameraRig";

/**
 * The WebGL hero: wireframe rift-valley terrain, abstract building masses and
 * the pulsing verified pin. No postprocessing — "bloom" is faked with additive
 * materials and sprite halos, which is effectively free on mobile GPUs.
 * Renders only while the hero is on screen (frameloop gating).
 */
export default function HeroScene({ lite = false }: { lite?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(1.5);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <Canvas
        dpr={dpr}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
        camera={{ fov: 38, position: [0, 5.5, 15], near: 0.1, far: 80 }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
        />
        <Terrain lite={lite} />
        <Buildings />
        <ParticleField count={lite ? 140 : 300} />
        <CameraRig />
      </Canvas>
    </div>
  );
}
