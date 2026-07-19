"use client";

import { Suspense, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import type { SpinState } from "./types";
import { PropertyPlane } from "./PropertyPlane";

export interface RingItem {
  id: string;
  url: string;
}

const REST = 0.0009; // below this |velocity| the ring is considered at rest
const DECAY = 0.92; // per-frame momentum decay after a fling
const AUTO_MS = 4200; // cadence of the idle auto-advance (echoes the brief's 3.5s)

/**
 * Owns the ring's motion: applies momentum, snaps to the nearest card at rest,
 * auto-advances one card every few seconds when idle, and reports the frontmost
 * card index up to React so the synced detail panel can follow.
 */
export function CarouselRing({
  items,
  spin,
  onActive,
  autoAdvance = true,
}: {
  items: RingItem[];
  spin: RefObject<SpinState>;
  onActive: (index: number) => void;
  autoAdvance?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const lastIndex = useRef(-1);
  const count = items.length;
  const step = (Math.PI * 2) / count;
  const radius = Math.max(2.9, count * 0.62);
  const autoAt = useRef(0);

  useFrame((state, dt) => {
    const g = groupRef.current;
    const s = spin.current;
    if (!g || !s) return;

    if (!s.dragging) {
      if (Math.abs(s.velocity) > REST) {
        // Coasting after a fling.
        s.angle += s.velocity;
        s.velocity *= DECAY;
        if (Math.abs(s.velocity) <= REST) {
          s.velocity = 0;
          s.target = Math.round(s.angle / step) * step;
        }
      } else {
        // Idle: auto-advance to the next card on a timer, then ease to target.
        const now = state.clock.elapsedTime * 1000;
        if (autoAt.current === 0) autoAt.current = now;
        if (autoAdvance && now - autoAt.current > AUTO_MS) {
          autoAt.current = now;
          s.target = Math.round(s.angle / step) * step - step;
        }
        s.angle += (s.target - s.angle) * Math.min(1, dt * 3.4);
      }
    } else {
      // While dragging, the pointer handler drives s.angle directly.
      autoAt.current = state.clock.elapsedTime * 1000;
    }

    g.rotation.y = s.angle;

    const idx = ((Math.round(-s.angle / step) % count) + count) % count;
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      onActive(idx);
    }
  });

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <Suspense key={it.id} fallback={null}>
          <PropertyPlane url={it.url} index={i} count={count} radius={radius} spin={spin} />
        </Suspense>
      ))}
    </group>
  );
}
