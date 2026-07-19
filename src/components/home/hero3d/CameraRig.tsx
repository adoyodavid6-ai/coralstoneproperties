"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { ScrollTrigger } from "@/lib/motion/gsap";

const LOOK_AT = new Vector3(4, 1.2, 0);

/**
 * Camera rig: pointer-lerped parallax (±) plus a scroll-scrubbed dolly — the
 * camera pulls back and lifts as the hero scrolls away.
 */
export function CameraRig() {
  const scrollRef = useRef(0);
  const target = useRef(new Vector3());

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  useFrame((state, delta) => {
    const p = scrollRef.current;
    target.current.set(
      state.pointer.x * 1.4,
      5.5 + state.pointer.y * -0.7 + p * 4.5,
      15 + p * 7,
    );
    state.camera.position.lerp(target.current, Math.min(1, delta * 3));
    state.camera.lookAt(LOOK_AT.x, LOOK_AT.y - p * 2.2, LOOK_AT.z);
  });

  return null;
}
