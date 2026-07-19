import type { Property } from "@/lib/types";

/**
 * Live spin state for the 3D ring, mutated imperatively (never via React state)
 * so the render loop stays allocation-free. Shared by ref between the ring's
 * physics loop and each card's depth-shading loop.
 *  - angle:    current ring rotation (radians)
 *  - velocity: momentum after a fling; decays each frame
 *  - target:   snap destination once momentum settles (nearest card, or the
 *              next card when the auto-advance timer fires)
 *  - dragging: pointer is currently down and steering the ring
 */
export interface SpinState {
  angle: number;
  velocity: number;
  target: number;
  dragging: boolean;
}

/** A switchable dataset for the carousel — the "interchangeable" filter chips. */
export interface ShowcaseGroup {
  id: string;
  label: string;
  test: (p: Property) => boolean;
}
