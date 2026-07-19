"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { Property } from "@/lib/types";
import type { SpinState } from "./types";
import { CarouselRing } from "./CarouselRing";

const SENS = 0.006; // radians of ring spin per pixel dragged
const CLICK_SLOP = 6; // px of movement still counted as a click, not a drag

/**
 * The WebGL stage: a draggable ring of property cards. Pointer handling lives on
 * the wrapping div (not inside the Canvas) so a flick anywhere over the stage
 * spins it, and a tap without drag opens the frontmost property.
 */
export default function Showcase3D({
  properties,
  onActive,
  onOpen,
}: {
  properties: Property[];
  onActive: (index: number) => void;
  onOpen: (index: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spin = useRef<SpinState>({ angle: 0, velocity: 0, target: 0, dragging: false });
  const drag = useRef({ lastX: 0, moved: 0, activeAtDown: 0 });
  const activeIndex = useRef(0);
  const [dpr, setDpr] = useState(1.5);
  const [visible, setVisible] = useState(true);

  const count = properties.length;
  const radius = Math.max(2.9, count * 0.62);
  const items = useMemo(
    () => properties.map((p) => ({ id: p.id, url: p.images[0] })),
    [properties],
  );

  // Reset the ring whenever the dataset swaps (the "interchangeable" chips).
  useEffect(() => {
    spin.current = { angle: 0, velocity: 0, target: 0, dragging: false };
    activeIndex.current = 0;
    onActive(0);
  }, [properties, onActive]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const s = spin.current;
    s.dragging = true;
    s.velocity = 0;
    drag.current.lastX = e.clientX;
    drag.current.moved = 0;
    drag.current.activeAtDown = activeIndex.current;
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    drag.current.moved += Math.abs(dx);
    const delta = dx * SENS;
    s.angle += delta;
    s.velocity = delta;
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    s.dragging = false;
    const step = (Math.PI * 2) / count;
    if (Math.abs(s.velocity) < 0.001) s.target = Math.round(s.angle / step) * step;
    // A tap that barely moved opens whatever card is at the front.
    if (drag.current.moved < CLICK_SLOP) onOpen(activeIndex.current);
  };

  return (
    <div
      ref={wrapRef}
      className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <Canvas
        dpr={dpr}
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        camera={{ fov: 40, position: [0, 0.3, radius + 2.7], near: 0.1, far: 100 }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(Math.min(1.75, window.devicePixelRatio))}
        />
        <ambientLight intensity={1} />
        <CarouselRing
          items={items}
          spin={spin}
          onActive={(i) => {
            activeIndex.current = i;
            onActive(i);
          }}
        />
      </Canvas>
    </div>
  );
}
