"use client";

import type { Property } from "@/lib/types";
import { SearchBar } from "@/components/search/SearchBar";
import { SplitHeading } from "@/lib/motion/SplitHeading";
import { Counter } from "@/lib/motion/Counter";
import { CheckShield } from "@/components/ui/icons";
import { PropertyShowcase } from "@/components/showcase/PropertyShowcase";
import { HOME_GROUPS } from "@/components/showcase/groups";

/**
 * The immersive landing: a draggable 3D ring of live listings is the hero. Every
 * kind of property cycles through the same stage, and the copy + search sit
 * alongside it. Dark cinematic scope carries straight into the page below.
 */
export function ImmersiveHero({ properties }: { properties: Property[] }) {
  return (
    <section
      id="hero"
      className="theme-dark relative overflow-hidden bg-surface text-ink"
    >
      {/* Golden light over the dark base to give the black a warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(900px 460px at 82% 4%, rgb(214 158 92 / 0.22), transparent 62%)",
        }}
      />
      <div className="container-page relative py-12 sm:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.55fr)]">
          {/* Copy + search */}
          <div className="max-w-xl">
            <span
              className="inline-flex items-center gap-2 rounded-full bg-surface-raised/70 px-3 py-1 text-xs font-medium text-primary ring-1 ring-line backdrop-blur"
              data-animate="fade"
            >
              <CheckShield className="h-3.5 w-3.5 text-verified" />
              Every agent, listing &amp; title — checked
            </span>

            <SplitHeading as="h1" className="display-1 mt-4 text-primary">
              Explore East Africa&apos;s verified homes in motion.
            </SplitHeading>

            <p
              className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft"
              data-animate="fade"
              data-animate-delay="0.25"
            >
              Drag through a living gallery of verified listings — houses, land,
              off-plan and short-lets across Kenya, Uganda, Tanzania and Rwanda.
              Then dive into the true cost, the neighbourhood truth and the title.
            </p>

            <div
              className="mt-6 rounded-2xl bg-surface-raised/60 p-2.5 ring-1 ring-line backdrop-blur-xl sm:p-3"
              data-animate
              data-animate-delay="0.35"
            >
              <SearchBar variant="hero" />
            </div>

            <dl
              className="mt-7 grid max-w-lg grid-cols-3 gap-6"
              data-animate="fade"
              data-animate-delay="0.5"
            >
              {[
                { n: 12480, suffix: "+", k: "Verified listings", accent: false },
                { n: 1900, suffix: "+", k: "Vetted agents", accent: false },
                { n: 3120, suffix: "", k: "Fraud reports actioned", accent: true },
              ].map((s) => (
                <div key={s.k}>
                  <dt
                    className={`figure text-xl font-semibold sm:text-2xl ${
                      s.accent ? "text-rose" : "text-primary"
                    }`}
                  >
                    <Counter to={s.n} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-1 text-sm text-ink-soft">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The 3D showcase — extended taller and wider, bleeding up and to the right */}
          <div
            className="lg:-mt-8 lg:-mr-10 xl:-mr-20"
            data-animate="fade"
            data-animate-delay="0.3"
          >
            <PropertyShowcase
              properties={properties}
              groups={HOME_GROUPS}
              stageHeight="clamp(360px, 64vh, 700px)"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
