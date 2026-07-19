"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { Heart } from "./icons";
import { cn } from "@/lib/cn";

const KEY = "vpl.saved";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function SaveButton({
  id,
  variant = "overlay",
}: {
  id: string;
  variant?: "overlay" | "inline";
}) {
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => setSaved(read().includes(id)), [id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = read();
    const idx = next.indexOf(id);
    if (idx >= 0) next.splice(idx, 1);
    else next.push(id);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(idx < 0);
    // Heart pop on save (respects reduced motion via the global CSS media query
    // — gsap tweens are gated here directly).
    if (idx < 0 && ref.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(
        ref.current,
        { scale: 0.7 },
        { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" },
      );
    }
  };

  if (variant === "inline") {
    return (
      <button
        ref={ref}
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? "Saved" : "Save"}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
          saved
            ? "border-accent bg-accent-soft text-accent"
            : "border-line-strong text-primary hover:border-accent hover:text-accent",
        )}
      >
        <Heart filled={saved} className="h-4 w-4" />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? "Saved" : "Save property"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-colors",
        saved
          ? "bg-white text-accent"
          : "bg-black/30 text-white hover:bg-black/45",
      )}
    >
      <Heart filled={saved} className="h-[18px] w-[18px]" />
    </button>
  );
}
