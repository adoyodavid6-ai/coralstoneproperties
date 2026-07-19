"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  EdgesGeometry,
  Group,
} from "three";
import { terrainHeight } from "./noise";

// Abstract building masses rising from the ridge — footprint x/z, size w/h/d.
const MASSES: { x: number; z: number; w: number; h: number; d: number }[] = [
  { x: 7, z: -1, w: 1.6, h: 5.2, d: 1.6 },
  { x: 9.4, z: 1.2, w: 1.3, h: 3.4, d: 1.3 },
  { x: 5.2, z: 1.8, w: 1.2, h: 2.6, d: 1.4 },
  { x: 11.6, z: -1.8, w: 1.4, h: 4.2, d: 1.2 },
];

// The tallest mass carries the verified pin.
const TALLEST = MASSES.reduce((a, b) => (b.h > a.h ? b : a), MASSES[0]);

function makeGlowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(78, 156, 124, 0.9)");
  g.addColorStop(0.35, "rgba(78, 156, 124, 0.35)");
  g.addColorStop(1, "rgba(78, 156, 124, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Wireframe building masses + the pulsing verified-green trust pin. */
export function Buildings() {
  const pinRef = useRef<Group>(null);
  const glowTexture = useMemo(() => makeGlowTexture(), []);

  const edges = useMemo(
    () =>
      MASSES.map((m) => ({
        ...m,
        y: terrainHeight(m.x, -m.z) - 1.5, // terrain mesh y-offset
        geometry: new EdgesGeometry(new BoxGeometry(m.w, m.h, m.d)),
      })),
    [],
  );

  const pinBase = terrainHeight(TALLEST.x, -TALLEST.z) - 1.5 + TALLEST.h + 1.1;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pinRef.current) {
      pinRef.current.position.y = pinBase + Math.sin(t * 1.4) * 0.18;
      const s = 1 + Math.sin(t * 2) * 0.12;
      pinRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {edges.map((m, i) => (
        <lineSegments key={i} geometry={m.geometry} position={[m.x, m.y + m.h / 2, m.z]}>
          <lineBasicMaterial color="#43719a" transparent opacity={0.75} />
        </lineSegments>
      ))}

      {/* Verified pin — a green glow above the tallest mass */}
      <group ref={pinRef} position={[TALLEST.x, pinBase, TALLEST.z]}>
        <mesh>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color="#4e9c7c" />
        </mesh>
        <sprite scale={[2.4, 2.4, 1]}>
          <spriteMaterial
            map={glowTexture}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </sprite>
        <pointLight color="#4e9c7c" intensity={2.2} distance={9} />
      </group>
    </group>
  );
}
