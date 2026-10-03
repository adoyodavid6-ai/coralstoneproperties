import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Brand — logo & colour",
  robots: { index: false },
};

const SWATCHES = [
  { name: "Surface", hex: "#F3F4F2", role: "Page background — light sage" },
  { name: "Paper", hex: "#FFFFFF", role: "Cards / panels" },
  { name: "Navy-teal", hex: "#16425B", role: "Header, footer, dark section bands" },
  { name: "Sage grey", hex: "#D9DCD6", role: "Mid sections, lines, borders" },
  { name: "Coral", hex: "#FF8559", role: "Tabs, CTAs, links, form accents, logo gem" },
  { name: "Ink soft", hex: "#5C7F96", role: "Secondary text, labels, meta" },
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
        <h1 className="mt-2 font-serif text-4xl font-semibold text-primary">CoralStones Properties Listings — logo &amp; colour</h1>
        <p className="mt-3 text-ink-soft">
          Navy-teal <span className="figure">#16425B</span> for structure, sage-grey{" "}
          <span className="figure">#D9DCD6</span> for blend sections, coral{" "}
          <span className="figure">#FF8559</span> for all interactive elements, on a light sage{" "}
          <span className="figure">#F3F4F2</span> surface.
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
