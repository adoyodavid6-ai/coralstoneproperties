"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { SpinState } from "./types";
import { CarouselRing, type RingItem } from "./CarouselRing";

const SENS = 0.006;

/** A draggable 3D ring of a single property's own photos — a "walk-around" tour. */
export default function GalleryStage({ items }: { items: RingItem[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spin = useRef<SpinState>({ angle: 0, velocity: 0, target: 0, dragging: false });
  const lastX = useRef(0);
  const [active, setActive] = useState(0);
  const [dpr, setDpr] = useState(1.5);
  const [visible, setVisible] = useState(true);

  const count = items.length;
  const radius = Math.max(2.9, count * 0.62);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    spin.current.dragging = true;
    spin.current.velocity = 0;
    lastX.current = e.clientX;
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    const delta = dx * SENS;
    s.angle += delta;
    s.velocity = delta;
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    s.dragging = false;
    const step = (Math.PI * 2) / count;
    if (Math.abs(s.velocity) < 0.001) s.target = Math.round(s.angle / step) * step;
  };

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
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
        <CarouselRing items={items} spin={spin} onActive={setActive} autoAdvance />
      </Canvas>

      <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-surface-raised/70 px-3 py-1 text-[11px] font-medium text-primary ring-1 ring-line backdrop-blur">
        <span className="figure">{String(active + 1).padStart(2, "0")}</span>
        <span className="text-ink-soft"> / {String(count).padStart(2, "0")}</span>
      </span>
      <span className="pointer-events-none absolute right-4 top-4 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-soft">
        Drag to orbit
      </span>
    </div>
  );
}
