"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points } from "three";

/** Slow-drifting luminous dust over the terrain. Deterministic positions. */
export function ParticleField({ count = 300 }: { count?: number }) {
  const ref = useRef<Points>(null);

  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    // Deterministic pseudo-random scatter (no Math.random — stable field).
    for (let i = 0; i < count; i++) {
      const a = Math.sin(i * 127.1) * 43758.5453;
      const b = Math.sin(i * 311.7) * 12543.8543;
      const c = Math.sin(i * 74.7) * 26951.2467;
      positions[i * 3] = ((a - Math.floor(a)) - 0.5) * 46; // x
      positions[i * 3 + 1] = (b - Math.floor(b)) * 9 - 0.5; // y
      positions[i * 3 + 2] = ((c - Math.floor(c)) - 0.5) * 24; // z
    }
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = t * 0.012;
      ref.current.position.y = Math.sin(t * 0.3) * 0.25;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#8fb6de"
        size={0.07}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
