"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useMotion } from "@/lib/motion/MotionProvider";
import { SearchBar } from "@/components/search/SearchBar";
import { SmartImage } from "@/components/ui/SmartImage";
import { HeroVisual } from "./hero3d/HeroVisual";
import { CheckShield, Chevron } from "@/components/ui/icons";
import { Counter } from "@/lib/motion/Counter";
import { SplitHeading } from "@/lib/motion/SplitHeading";
import { cn } from "@/lib/cn";

// Twilight modern home — Unsplash License (free for commercial use, no
// attribution required). https://unsplash.com/photos/G48h926L2qo
const HERO_PHOTO =
  "https://images.unsplash.com/photo-1757359056339-22968344cce6?q=80&w=2400&auto=format&fit=crop";

export function Hero() {
  const { t } = useLocale();
  const { tier } = useMotion();
  return (
    <section
      id="hero"
      className="theme-dark relative flex min-h-[56svh] items-center overflow-hidden bg-surface text-ink"
    >
      {/* Twilight home photograph — the cinematic base layer */}
      <div aria-hidden className="absolute inset-0 opacity-70">
        <SmartImage
          src={HERO_PHOTO}
          alt=""
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
      </div>

      {/* WebGL wireframe terrain blended over the photo — full tier only;
          lite/off devices get the photograph alone */}
      {tier === "full" && (
        <div aria-hidden className="absolute inset-0 mix-blend-screen opacity-80">
          <HeroVisual />
        </div>
      )}

      {/* Scrims — deepen the left side to near-black so the bone copy reads */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(11,13,14,0.92) 0%, rgba(11,13,14,0.72) 42%, rgba(11,13,14,0.12) 100%)",
        }}
      />
      <div className="container-page relative py-16 sm:py-20">
        <div className="max-w-2xl">
          <span
            className="inline-flex items-center gap-2 rounded-full bg-surface-raised/70 px-3 py-1 text-xs font-medium text-primary ring-1 ring-line backdrop-blur"
            data-animate="fade"
          >
            <CheckShield className="h-3.5 w-3.5 text-verified" />
            {t("hero.eyebrow")}
          </span>

          <SplitHeading as="h1" className="display-1 mt-4 text-primary">
            {t("hero.title")}
          </SplitHeading>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft" data-animate="fade" data-animate-delay="0.25">
            {t("hero.subtitle")}
          </p>

          {/* Floating glass search panel */}
          <div
            className="mt-6 rounded-2xl bg-surface-raised/60 p-2.5 ring-1 ring-line backdrop-blur-xl sm:p-3"
            data-animate
            data-animate-delay="0.35"
          >
            <SearchBar variant="hero" />
          </div>

          <dl className="mt-7 grid max-w-lg grid-cols-3 gap-6" data-animate="fade" data-animate-delay="0.5">
            {[
              { n: 12480, suffix: "+", k: t("hero.stat.verified"), accent: false },
              { n: 1900, suffix: "+", k: t("hero.stat.agents"), accent: false },
              { n: 3120, suffix: "", k: t("hero.stat.fraud"), accent: true },
            ].map((s) => (
              <div key={s.k}>
                <dt
                  className={cn(
                    "figure text-xl font-semibold sm:text-2xl",
                    s.accent ? "text-rose" : "text-primary",
                  )}
                >
                  <Counter to={s.n} suffix={s.suffix} />
                </dt>
                <dd className="mt-1 text-sm text-ink-soft">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-ink-soft sm:flex"
      >
        <span className="eyebrow text-[10px]">Scroll</span>
        <Chevron className="h-4 w-4 animate-float" />
      </div>
    </section>
  );
}
