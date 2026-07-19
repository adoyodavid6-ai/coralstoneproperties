"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches any WebGL / texture-load failure inside the 3D stage and shows a
 * graceful fallback instead of tearing down the page.
 */
export class ShowcaseBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
