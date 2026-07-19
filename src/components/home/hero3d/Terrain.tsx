"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
} from "three";
import { terrainHeight } from "./noise";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vElev;
  varying float vDist;
  void main() {
    vUv = uv;
    vElev = position.z;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorLow;
  uniform vec3 uColorHigh;
  uniform vec2 uCells;
  varying vec2 vUv;
  varying float vElev;
  varying float vDist;
  void main() {
    // Luminous grid lines along the wireframe cells.
    vec2 f = fract(vUv * uCells);
    float d = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
    float line = 1.0 - smoothstep(0.0, 0.09, d);

    float elevN = clamp(vElev / 3.2, 0.0, 1.0);
    vec3 color = mix(uColorLow, uColorHigh, elevN);

    // Slow breathing shimmer that drifts across the ridge.
    float pulse = 0.85 + 0.15 * sin(uTime * 0.5 + vUv.x * 8.0 + vUv.y * 5.0);

    // Distance fade — additive over near-black reads as fog.
    float fog = 1.0 - smoothstep(18.0, 52.0, vDist);

    float alpha = line * (0.16 + 0.55 * elevN) * fog * pulse;
    gl_FragColor = vec4(color, alpha);
  }
`;

const SEGMENTS_X = 96;
const SEGMENTS_Y = 48;

/** Wireframe rift-valley terrain — luminous slate lines over near-black. */
export function Terrain({ lite = false }: { lite?: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null);

  const segX = lite ? SEGMENTS_X / 2 : SEGMENTS_X;
  const segY = lite ? SEGMENTS_Y / 2 : SEGMENTS_Y;

  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(60, 30, segX, segY);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, terrainHeight(pos.getX(i), pos.getY(i)));
    }
    pos.needsUpdate = true;
    return geo;
  }, [segX, segY]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorLow: { value: new Color("#43719a") },
      uColorHigh: { value: new Color("#8fb6de") },
      uCells: { value: new Vector2(segX, segY) },
    }),
    [segX, segY],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  );
}
