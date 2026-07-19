"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Group, Mesh, MeshBasicMaterial, SRGBColorSpace, TextureLoader } from "three";
import type { SpinState } from "./types";

const CARD_W = 2.0;
const CARD_H = 1.4;

/**
 * One property on the ring: a texture-mapped plane on a dark matte, placed at a
 * fixed angle around the circle. Its own frame loop reads the shared spin angle
 * and grows/brightens the card as it swings to the front — so the frontmost card
 * always reads as "active" without any React re-renders.
 */
export function PropertyPlane({
  url,
  index,
  count,
  radius,
  spin,
}: {
  url: string;
  index: number;
  count: number;
  radius: number;
  spin: RefObject<SpinState>;
}) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const matteRef = useRef<Mesh>(null);

  // The card's home angle around the ring (evenly spaced).
  const base = (index / count) * Math.PI * 2;
  const position = useMemo<[number, number, number]>(
    () => [Math.sin(base) * radius, 0, Math.cos(base) * radius],
    [base, radius],
  );

  const texture = useLoader(TextureLoader, url);
  useMemo(() => {
    // Cover-fit the photo into the card and correct its colour space.
    texture.colorSpace = SRGBColorSpace;
    const img = texture.image as { width: number; height: number } | undefined;
    if (img?.width && img?.height) {
      const imgAspect = img.width / img.height;
      const planeAspect = CARD_W / CARD_H;
      if (imgAspect > planeAspect) {
        texture.repeat.set(planeAspect / imgAspect, 1);
        texture.offset.set((1 - planeAspect / imgAspect) / 2, 0);
      } else {
        texture.repeat.set(1, imgAspect / planeAspect);
        texture.offset.set(0, (1 - imgAspect / planeAspect) / 2);
      }
    }
    return texture;
  }, [texture]);

  useFrame(() => {
    const g = groupRef.current;
    const s = spin.current;
    if (!g || !s) return;
    // How close this card is to the camera-facing front: 1 = dead centre.
    const depth = Math.cos(base + s.angle); // −1 (back) … 1 (front)
    const t = (depth + 1) / 2; // 0 … 1
    const eased = t * t;
    const scale = 0.8 + 0.32 * eased;
    g.scale.setScalar(scale);
    g.position.y = 0.12 * (1 - eased); // back cards ride a touch higher
    const opacity = 0.18 + 0.82 * eased;
    if (meshRef.current) (meshRef.current.material as MeshBasicMaterial).opacity = opacity;
    if (matteRef.current)
      (matteRef.current.material as MeshBasicMaterial).opacity = 0.28 + 0.5 * eased;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, base, 0]}>
      {/* Dark matte frame behind the photo */}
      <mesh ref={matteRef} position={[0, 0, -0.02]}>
        <planeGeometry args={[CARD_W + 0.14, CARD_H + 0.14]} />
        <meshBasicMaterial color="#0a0f14" transparent toneMapped={false} />
      </mesh>
      <mesh ref={meshRef}>
        <planeGeometry args={[CARD_W, CARD_H]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
