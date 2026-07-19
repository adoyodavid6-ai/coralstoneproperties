import type { Property } from "@/lib/types";
import { TITLE_LABEL } from "@/lib/labels";
import { Pin, Check, CheckShield } from "@/components/ui/icons";

function Bar({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 80 ? "bg-verified" : value >= 65 ? "bg-accent" : "bg-warning";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="figure font-semibold text-primary">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function LocationIntelligence({ property }: { property: Property }) {
  const g = property.area_guide;
  // Approximate coords only (exact address is withheld until enquiry). A neighbourhood-zoom
  // bounding box keeps the pin area-level rather than house-level.
  const d = 0.012;
  const bbox = [
    property.lng - d * 1.5,
    property.lat - d,
    property.lng + d * 1.5,
    property.lat + d,
  ].join(",");
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${property.lat},${property.lng}`;
  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
      <h3 className="font-serif text-lg text-primary">Location intelligence</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Honest neighbourhood signals for {g.area}, {g.county} — cached and refreshed,
        blended with verified-resident input.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <Bar label="Security" value={g.security} />
          <Bar label="Water reliability" value={g.waterReliability} />
          <Bar label="Power reliability" value={g.powerReliability} />
          <Bar label="Road access" value={g.roadAccess} />
        </div>

        {/* Real neighbourhood map (OpenStreetMap, no API key). Approximate pin only.
            The light map is framed as a deliberate "paper" artifact on the dark site. */}
        <div className="relative min-h-44 overflow-hidden rounded-xl ring-1 ring-line">
          <iframe
            title={`Map of ${g.area}, ${g.county}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
          />
          <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-surface-raised/90 px-2 py-1 text-[11px] text-ink-soft shadow-card">
            <Pin className="h-3 w-3 text-accent" />
            Approximate area · exact address shared after enquiry
          </span>
        </div>
      </div>
    </section>
  );
}

export function OffPlanProgress({ property }: { property: Property }) {
  if (property.type !== "off_plan" || property.completionPercent == null) return null;
  const milestones = [
    { label: "Groundworks & foundation", at: 20 },
    { label: "Superstructure", at: 45 },
    { label: "Roofing & envelope", at: 70 },
    { label: "Finishes & services", at: 90 },
    { label: "Handover", at: 100 },
  ];
  const pct = property.completionPercent;
  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
      <div className="flex items-center gap-2 text-accent">
        <CheckShield className="h-5 w-5" />
        <h3 className="font-serif text-lg text-primary">Construction progress</h3>
      </div>
      <p className="mt-1 text-sm text-ink-soft">
        Real, developer-verified milestones — not a marketing render. Instalments track
        against build stage.
      </p>

      <div className="mt-5 flex items-center justify-between">
        <span className="figure text-3xl font-semibold text-primary">{pct}%</span>
        <span className="text-sm text-ink-soft">
          Handover {new Date(property.handoverDate!).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-5 space-y-2.5">
        {milestones.map((m) => {
          const done = pct >= m.at;
          return (
            <li key={m.label} className="flex items-center gap-3 text-sm">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full ${
                  done ? "bg-verified text-white" : "bg-line text-ink-soft"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className={done ? "text-primary" : "text-ink-soft"}>{m.label}</span>
              <span className="figure ml-auto text-xs text-ink-soft">{m.at}%</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LandToolkit({ property }: { property: Property }) {
  if (property.type !== "land" || !property.titleType) return null;
  const checklist = [
    "Confirm the title deed matches the seller's ID",
    "Run an official search at the land registry",
    "Verify beacons on the ground with a licensed surveyor",
    "Check for caveats, charges or pending cases",
    "Confirm rates and land-rent clearance certificates",
    "Get a sale agreement drawn by a verified conveyancer",
  ];
  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
      <h3 className="font-serif text-lg text-primary">Land-buyer toolkit</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-muted p-4">
          <p className="text-xs text-ink-soft">Title type</p>
          <p className="mt-1 font-semibold text-primary">{TITLE_LABEL[property.titleType]}</p>
          <p className="mt-3 text-xs text-ink-soft">
            {property.verified.some((v) => v.kind === "title") ? (
              <span className="inline-flex items-center gap-1.5 text-verified">
                <CheckShield className="h-4 w-4" /> Title verified at listing
              </span>
            ) : (
              "Buyer-initiated title search available on request."
            )}
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">Due-diligence checklist</p>
          <ul className="space-y-1.5">
            {checklist.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-ink-soft">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
