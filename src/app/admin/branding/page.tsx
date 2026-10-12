"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin/AdminStore";
import type { ProjectBrand, ProjectBrandStatus } from "@/lib/admin/types";
import { Field, Panel, inputClass } from "@/components/admin/ui";
import { ProjectBrandMark, ProjectPicker } from "@/components/admin/ProjectBrand";
import { Upload, Trash } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const STATUS: Record<ProjectBrandStatus, { label: string; cls: string }> = {
  onboarding: { label: "Onboarding", cls: "bg-warning-soft text-warning ring-warning/20" },
  live: { label: "Live", cls: "bg-verified-soft text-verified ring-verified/20" },
  paused: { label: "Paused", cls: "bg-surface-muted text-ink-soft ring-line" },
};

const HEX = /^#[0-9a-f]{6}$/i;
const MAX_LOGO_PX = 256;

/** Downscale an uploaded logo so the localStorage working copy stays small. SVGs pass through. */
function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = reader.result as string;
      if (file.type === "image/svg+xml") return resolve(src);
      const img = new Image();
      img.onerror = () => reject(new Error("Unreadable image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_LOGO_PX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  // Local draft so a half-typed hex doesn't overwrite the saved colour.
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-surface p-1"
        />
        <input
          className={cn(inputClass, "figure uppercase", !HEX.test(draft) && "border-danger")}
          value={draft}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setDraft(v);
            if (HEX.test(v)) onChange(v.toLowerCase());
          }}
        />
      </div>
    </Field>
  );
}

function BrandPreview({ brand }: { brand: ProjectBrand }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line shadow-card">
      <div className="flex items-center gap-4 px-5 py-6" style={{ background: brand.primaryColor }}>
        <ProjectBrandMark brand={brand} size={56} />
        <div className="min-w-0">
          <p className="truncate font-serif text-xl font-semibold text-white">{brand.name || "Untitled project"}</p>
          <p className="truncate text-sm text-white/75">{brand.location || "Location"}</p>
        </div>
      </div>
      <div className="space-y-4 bg-surface-raised px-5 py-5">
        <p className="text-sm text-ink-soft">{brand.tagline || "Project tagline appears here."}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: brand.accentColor }}
          >
            Enquire now
          </span>
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: brand.primaryColor, color: brand.primaryColor }}
          >
            by {brand.developer || "Developer"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminBranding() {
  const { projectBrands, agents, addProjectBrand, updateProjectBrand, deleteProjectBrand } = useAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const selected = projectBrands.find((b) => b.id === selectedId) ?? projectBrands[0];
  const developers = agents.filter((a) => a.verified.includes("developer"));
  const set = (patch: Partial<ProjectBrand>) => selected && updateProjectBrand(selected.id, patch);

  async function onLogo(file: File | undefined) {
    setLogoError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setLogoError("Please choose an image file.");
    try {
      const data = await readLogo(file);
      if (data.length > 400_000) return setLogoError("That logo is too large — try a smaller PNG or SVG.");
      set({ logo: data });
    } catch {
      setLogoError("Couldn't read that image.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">Project branding</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Brand kits for every developer project onboarded to CoralStones — name, colours and logo.
          </p>
        </div>
        <button
          onClick={() => setSelectedId(addProjectBrand())}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
        >
          + Add project
        </button>
      </div>

      <Panel title="Project">
        <ProjectPicker brands={projectBrands} value={selected?.id ?? null} onChange={setSelectedId} />
      </Panel>

      {selected ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel
            title="Brand kit"
            actions={
              <button
                onClick={() => {
                  if (confirm(`Remove ${selected.name}? This deletes its brand kit.`)) {
                    deleteProjectBrand(selected.id);
                    setSelectedId(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:border-danger hover:text-danger"
              >
                <Trash className="h-3.5 w-3.5" />
                Remove
              </button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name">
                <input className={inputClass} value={selected.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  value={selected.status}
                  onChange={(e) => set({ status: e.target.value as ProjectBrandStatus })}
                >
                  {(Object.keys(STATUS) as ProjectBrandStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS[s].label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Developer">
                <input
                  className={inputClass}
                  value={selected.developer}
                  list="developer-accounts"
                  onChange={(e) => {
                    const match = developers.find((a) => a.name === e.target.value);
                    set({ developer: e.target.value, agentId: match?.id });
                  }}
                />
                <datalist id="developer-accounts">
                  {developers.map((a) => (
                    <option key={a.id} value={a.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="Location">
                <input className={inputClass} value={selected.location} onChange={(e) => set({ location: e.target.value })} />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <input className={inputClass} value={selected.tagline} onChange={(e) => set({ tagline: e.target.value })} />
              </Field>
              <ColorField label="Project colour" value={selected.primaryColor} onChange={(primaryColor) => set({ primaryColor })} />
              <ColorField label="Accent colour" value={selected.accentColor} onChange={(accentColor) => set({ accentColor })} />

              <Field label="Logo" className="sm:col-span-2">
                <div className="flex flex-wrap items-center gap-3">
                  <ProjectBrandMark brand={selected} size={56} />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-sm font-medium text-primary hover:border-accent hover:text-accent">
                    <Upload className="h-4 w-4" />
                    Upload logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="sr-only"
                      onChange={(e) => {
                        void onLogo(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {selected.logo && (
                    <button
                      type="button"
                      onClick={() => set({ logo: "" })}
                      className="text-sm font-medium text-ink-soft hover:text-danger"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
                <input
                  className={cn(inputClass, "mt-2")}
                  placeholder="…or paste a logo URL (https://)"
                  value={selected.logo.startsWith("data:") ? "" : selected.logo}
                  onChange={(e) => set({ logo: e.target.value.trim() })}
                />
                {logoError && <p className="mt-1.5 text-xs text-danger">{logoError}</p>}
              </Field>
            </div>
          </Panel>

          <Panel title="Preview">
            <BrandPreview brand={selected} />
          </Panel>
        </div>
      ) : (
        <Panel>
          <p className="py-8 text-center text-sm text-ink-soft">No projects yet — add the first one to start its brand kit.</p>
        </Panel>
      )}

      <Panel title={`All projects (${projectBrands.length})`}>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projectBrands.map((b) => (
            <li key={b.id}>
              <button
                onClick={() => setSelectedId(b.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-accent",
                  b.id === selected?.id ? "border-accent bg-accent-soft" : "border-line bg-surface",
                )}
              >
                <ProjectBrandMark brand={b} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-primary">{b.name}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <span className="h-3 w-6 rounded-full" style={{ background: b.primaryColor }} />
                    <span className="h-3 w-6 rounded-full" style={{ background: b.accentColor }} />
                    <span className="figure text-[11px] uppercase text-ink-soft">{b.primaryColor}</span>
                  </span>
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", STATUS[b.status].cls)}>
                  {STATUS[b.status].label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
