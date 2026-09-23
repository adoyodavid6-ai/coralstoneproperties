"use client";

import { useEffect, useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { Camera, Close, Chevron } from "@/components/ui/icons";
import { useMotion } from "@/lib/motion/MotionProvider";
import { SHOW_REAL_MEDIA } from "@/lib/media";
import type { Property } from "@/lib/types";

export function Gallery({ property }: { property: Property }) {
  const images = property.images;
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const { stopScroll, startScroll } = useMotion();

  const go = (d: number) =>
    setIdx((i) => (i + d + images.length) % images.length);

  useEffect(() => {
    if (!open) return;
    // Freeze Lenis smooth scroll while the lightbox is open.
    stopScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      startScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, images.length]);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  // While real media is off, show a single branded placeholder — no thumbnail
  // grid, lightbox or photo counts for photography that isn't there yet.
  if (!SHOW_REAL_MEDIA) {
    return (
      <div className="h-56 overflow-hidden rounded-2xl sm:h-[440px]">
        <MediaPlaceholder label="Photos coming soon" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[440px]">
        <button
          onClick={() => openAt(0)}
          className="relative col-span-4 row-span-2 h-56 sm:col-span-2 sm:h-full"
          aria-label="Open gallery"
        >
          <SmartImage src={images[0]} alt={`${property.title} — main photo`} priority />
        </button>

        {images.slice(1, 5).map((src, i) => (
          <button
            key={src + i}
            onClick={() => openAt(i + 1)}
            className="relative hidden h-full sm:block"
            aria-label={`Photo ${i + 2}`}
          >
            <SmartImage src={src} alt={`${property.title} — photo ${i + 2}`} />
            {i === 3 && images.length > 5 && (
              <span className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-semibold text-white backdrop-blur-sm">
                +{images.length - 5} more
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => openAt(0)}
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-raised px-4 py-2 text-sm font-medium text-primary hover:border-accent sm:hidden"
      >
        <Camera className="h-4 w-4 text-accent" />
        View all {images.length} photos
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
        >
          <div className="flex items-center justify-between p-4 text-white">
            <span className="figure text-sm">
              {idx + 1} / {images.length}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Close gallery"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center px-2 pb-6">
            <button
              onClick={() => go(-1)}
              className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous"
            >
              <Chevron className="h-6 w-6 rotate-90" />
            </button>
            <div className="h-full max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-xl">
              <SmartImage src={images[idx]} alt={`${property.title} — photo ${idx + 1}`} priority />
            </div>
            <button
              onClick={() => go(1)}
              className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next"
            >
              <Chevron className="h-6 w-6 -rotate-90" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
