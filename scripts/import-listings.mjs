#!/usr/bin/env node
/**
 * Import real agents + listings into Supabase.
 *
 *   npm run db:import                      # imports data/listings.import.json
 *   npm run db:import -- path/to/file.json # imports a custom file
 *   npm run db:import -- --dry-run         # validate only, write nothing
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (the service-role key bypasses RLS, so this must only ever run locally / in
 * CI — never ship it to the browser). Input field names mirror the camelCase
 * `Property`/`Agent` types in src/lib/types.ts; this script maps them to the
 * snake_case columns defined in supabase/schema.sql.
 *
 * Idempotent: agents upsert on `id`, properties upsert on `slug`, so re-running
 * the same file updates existing rows instead of duplicating them.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

// --------------------------------------------------------------------------
// Env — load .env.local without adding a dotenv dependency.
// --------------------------------------------------------------------------
function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!m || line.trimStart().startsWith("#")) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadEnvLocal();

// --------------------------------------------------------------------------
// Schema enums (kept in sync with supabase/schema.sql) for pre-flight checks.
// --------------------------------------------------------------------------
const ENUMS = {
  type: ["apartment", "house", "townhouse", "land", "commercial", "off_plan", "venue"],
  intent: ["sale", "rent", "short_let"],
  status: ["draft", "pending_review", "active", "under_offer", "reserved", "sold", "let", "withdrawn"],
  currency: ["KES", "UGX", "TZS", "RWF", "USD", "GBP"],
  pricePeriod: ["total", "month", "night", "day"],
  sizeUnit: ["sqm", "sqft", "acres"],
  plotSizeUnit: ["acres", "sqm"],
  furnishing: ["furnished", "semi_furnished", "unfurnished"],
  titleType: ["freehold", "leasehold", "sectional", "controlled"],
  country: ["Kenya", "Uganda", "Tanzania", "Rwanda"],
  boostTier: ["featured", "spotlight"],
};
// Only Kenya is a live market right now (see src/lib/countries.ts). Non-live
// rows import fine but won't render until their country is switched on.
const LIVE_COUNTRIES = new Set(["Kenya"]);
const REQUIRED = ["slug", "title", "type", "intent", "price", "currency", "country", "county", "area"];

// camelCase input key -> snake_case DB column. Keys not listed pass through
// unchanged (they're already single lowercase words: slug, title, price, …).
const KEY_MAP = {
  pricePeriod: "price_period",
  previousPrice: "previous_price",
  sizeUnit: "size_unit",
  plotSize: "plot_size",
  plotSizeUnit: "plot_size_unit",
  yearBuilt: "year_built",
  serviceCharge: "service_charge",
  titleType: "title_type",
  hasVideo: "has_video",
  has3dTour: "has_3d_tour",
  hasDrone: "has_drone",
  boostTier: "boost_tier",
  aiAssistedDescription: "ai_assisted_description",
  agentId: "agent_id",
  areaGuide: "area_guide",
  listedOn: "listed_on",
  viewCount: "view_count",
  saveCount: "save_count",
  completionPercent: "completion_percent",
  handoverDate: "handover_date",
  avatarUrl: "avatar_url",
  responseMins: "response_mins",
  completedDeals: "completed_deals",
};

function toRow(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "_readme" || v === undefined) continue;
    out[KEY_MAP[k] ?? k] = v;
  }
  return out;
}

// --------------------------------------------------------------------------
// Validation — fail loudly before touching the database.
// --------------------------------------------------------------------------
function validate(data) {
  const errors = [];
  const warnings = [];
  const agents = Array.isArray(data.agents) ? data.agents : [];
  const properties = Array.isArray(data.properties) ? data.properties : [];

  const agentIds = new Set();
  agents.forEach((a, i) => {
    if (!a.id) errors.push(`agents[${i}]: missing "id"`);
    if (!a.name) errors.push(`agents[${i}] (${a.id ?? "?"}): missing "name"`);
    if (a.id) agentIds.add(a.id);
  });

  const slugs = new Set();
  properties.forEach((p, i) => {
    const tag = `properties[${i}] (${p.slug ?? "no-slug"})`;
    for (const field of REQUIRED) {
      if (p[field] === undefined || p[field] === null || p[field] === "") {
        errors.push(`${tag}: missing required field "${field}"`);
      }
    }
    for (const [field, allowed] of Object.entries(ENUMS)) {
      if (p[field] !== undefined && !allowed.includes(p[field])) {
        errors.push(`${tag}: ${field}="${p[field]}" not one of ${allowed.join(", ")}`);
      }
    }
    if (p.slug) {
      if (slugs.has(p.slug)) errors.push(`${tag}: duplicate slug in file`);
      slugs.add(p.slug);
    }
    if (p.agentId && !agentIds.has(p.agentId)) {
      errors.push(`${tag}: agentId "${p.agentId}" has no matching entry in "agents"`);
    }
    if (p.country && !LIVE_COUNTRIES.has(p.country)) {
      warnings.push(`${tag}: country "${p.country}" is not a live market yet — row will import but stay hidden`);
    }
    if (p.status === "active" && Array.isArray(p.images) && p.images.length === 0) {
      warnings.push(`${tag}: status "active" with no images — renders with placeholder art until SHOW_REAL_MEDIA is on`);
    }
    if (p.status === "active") {
      warnings.push(`${tag}: status "active" — this listing goes PUBLIC on import`);
    }
  });

  return { errors, warnings, agents, properties };
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const file = args.find((a) => !a.startsWith("--")) ?? "data/listings.import.json";
  const path = resolve(process.cwd(), file);

  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`✗ Could not read/parse ${file}: ${err.message}`);
    process.exit(1);
  }

  const { errors, warnings, agents, properties } = validate(data);

  if (warnings.length) {
    console.warn("\nWarnings:");
    for (const w of warnings) console.warn(`  ⚠ ${w}`);
  }
  if (errors.length) {
    console.error("\nValidation failed — nothing was written:");
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(`\n✓ Validated ${agents.length} agent(s) and ${properties.length} listing(s).`);

  if (dryRun) {
    console.log("Dry run — no database writes.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "\n✗ NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set in .env.local.\n" +
        "  Add them (Supabase → Settings → API) and run supabase/schema.sql first.",
    );
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (agents.length) {
    const { error } = await sb.from("agents").upsert(agents.map(toRow), { onConflict: "id" });
    if (error) {
      console.error(`\n✗ Agent upsert failed: ${error.message}`);
      process.exit(1);
    }
    console.log(`✓ Upserted ${agents.length} agent(s).`);
  }

  if (properties.length) {
    const { error } = await sb.from("properties").upsert(properties.map(toRow), { onConflict: "slug" });
    if (error) {
      console.error(`\n✗ Property upsert failed: ${error.message}`);
      process.exit(1);
    }
    console.log(`✓ Upserted ${properties.length} listing(s).`);
  }

  const active = properties.filter((p) => p.status === "active").length;
  console.log(
    `\nDone. ${active} listing(s) are 'active' (publicly visible); ` +
      `${properties.length - active} held back as draft/pending.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
