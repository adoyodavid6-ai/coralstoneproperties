import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Brand — logo & colour",
  robots: { index: false },
};

const SWATCHES = [
  { name: "Ink / primary", hex: "#172B3E", role: "Headings, body, buttons" },
  { name: "Brand / accent", hex: "#2D4E6C", role: "Links, accents" },
  { name: "Brand bright", hex: "#43719A", role: "Header band, glow, dark-hero accent" },
  { name: "Coral (appeal)", hex: "#FF8559", role: "Logo Stone, marks, accents" },
  { name: "Surface (cream)", hex: "#F7F2E9", role: "Page background" },
  { name: "Paper (warm)", hex: "#FFFDF8", role: "Cards / panels" },
];

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface-raised p-8">
      <div className="grid min-h-16 place-items-center">{children}</div>
      <span className="figure text-xs text-ink-soft">{label}</span>
    </div>
  );
}

function DarkCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-surface-dark p-8">
      <div className="grid min-h-16 place-items-center">{children}</div>
      <span className="figure text-xs text-white/60">{label}</span>
    </div>
  );
}

export default function BrandPage() {
  return (
    <div className="container-page py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Brand sign-off</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-primary">CoralStone Properties Listings — logo &amp; colour</h1>
        <p className="mt-3 text-ink-soft">
          Warm cream light-filled pages, deep navy ink, the slate-blue accent{" "}
          <span className="figure">#2D4E6C</span> and the brand-bright header band{" "}
          <span className="figure">#43719A</span> — the CoralStone mark carries the coral{" "}
          <span className="figure">#FF8559</span>.
          All colours are Tailwind theme tokens — no ad-hoc hex.
        </p>
      </header>

      {/* Palette */}
      <section className="mt-12">
        <h2 className="font-serif text-xl text-primary">Palette</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name}>
              <div
                className="h-20 rounded-xl border border-line"
                style={{ background: s.hex }}
              />
              <p className="mt-2 text-sm font-medium text-primary">{s.name}</p>
              <p className="figure text-xs text-ink-soft">{s.hex}</p>
              <p className="mt-0.5 text-xs text-ink-soft/80">{s.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* On light */}
      <section className="mt-12">
        <h2 className="font-serif text-xl text-primary">Logo — on light</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="full-light"><Logo variant="full-light" href="/brand" /></Card>
          <Card label="stacked"><Logo variant="stacked" href="/brand" /></Card>
          <Card label="emblem"><Logo variant="emblem" size={48} href="/brand" /></Card>
          <Card label="mono (ink)"><Logo variant="mono" monoTone="ink" href="/brand" /></Card>
        </div>
      </section>

      {/* On dark */}
      <section className="mt-8">
        <h2 className="font-serif text-xl text-primary">Logo — on dark</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DarkCard label="full-dark"><Logo variant="full-dark" href="/brand" /></DarkCard>
          <DarkCard label="full-dark @ large"><Logo variant="full-dark" size={56} href="/brand" /></DarkCard>
          <DarkCard label="emblem"><Logo variant="emblem" size={48} href="/brand" /></DarkCard>
          <DarkCard label="mono (paper)"><Logo variant="mono" monoTone="paper" href="/brand" /></DarkCard>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-primary">Scale &amp; favicon</h2>
        <div className="mt-5 flex flex-wrap items-end gap-8 rounded-2xl border border-line bg-surface-raised p-8">
          <Logo variant="full-light" size={28} href="/brand" />
          <Logo variant="full-light" size={40} href="/brand" />
          <Logo variant="full-light" size={56} href="/brand" />
          <Logo variant="emblem" size={32} href="/brand" />
          <Logo variant="emblem" size={20} href="/brand" />
        </div>
      </section>
    </div>
  );
}
