import Image from "next/image";
import { SHOW_REAL_MEDIA } from "@/lib/media";
import { MediaPlaceholder } from "./MediaPlaceholder";

// A branded gray gradient (inline SVG data URI) used as the blur-up placeholder,
// so a slow or dead image URL never renders as a jarring blank/broken box.
const BLUR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='10'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#d9dcd6'/>
        <stop offset='1' stop-color='#b8bcb5'/>
      </linearGradient></defs>
      <rect width='16' height='10' fill='url(#g)'/>
    </svg>`,
  );

interface Props {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Caption for the placeholder shown while real media is off (large surfaces only). */
  placeholderLabel?: string;
}

/**
 * Fills its (relatively positioned) parent with an optimised image.
 * Uses next/image for on-demand resizing, modern formats, lazy-loading and a
 * blur-up placeholder — replacing the previous hot-linked <img>.
 *
 * While real media is off (see src/lib/media.ts) it renders a branded
 * placeholder instead, so no stock/placeholder photo ever ships.
 */
export function SmartImage({ src, alt, className, sizes, priority, placeholderLabel }: Props) {
  if (!SHOW_REAL_MEDIA) {
    return <MediaPlaceholder label={placeholderLabel} />;
  }
  return (
    <span className="relative block h-full w-full overflow-hidden bg-surface-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR}
        className={`object-cover ${className ?? ""}`}
      />
    </span>
  );
}
