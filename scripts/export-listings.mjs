#!/usr/bin/env node
/**
 * Export current agents + listings from Supabase back to the import file shape,
 * so you can round-trip edits (export → tweak JSON → `npm run db:import`).
 *
 *   npm run db:export                       # -> data/listings.export.json (all statuses)
 *   npm run db:export -- path/to/file.json  # custom output path
 *   npm run db:export -- --active-only      # only publicly-visible listings
 *   npm run db:export -- --stdout           # print to stdout instead of a file
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * The service-role key is used so drafts/pending rows are included too; pass
 * --active-only to get just what the public sees. Columns are mapped from the
 * snake_case DB shape back to the camelCase `Property`/`Agent` field names that
 * scripts/import-listings.mjs consumes.
 */
import { readFileSync, writeFileSync } from "node:fs";
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

// snake_case DB column -> camelCase input key (reverse of import's KEY_MAP).
const SNAKE_TO_CAMEL = {
  price_period: "pricePeriod",
  previous_price: "previousPrice",
  size_unit: "sizeUnit",
  plot_size: "plotSize",
  plot_size_unit: "plotSizeUnit",
  year_built: "yearBuilt",
  service_charge: "serviceCharge",
  title_type: "titleType",
  has_video: "hasVideo",
  has_3d_tour: "has3dTour",
  has_drone: "hasDrone",
  boost_tier: "boostTier",
  ai_assisted_description: "aiAssistedDescription",
  agent_id: "agentId",
  area_guide: "areaGuide",
  listed_on: "listedOn",
  view_count: "viewCount",
  save_count: "saveCount",
  completion_percent: "completionPercent",
  handover_date: "handoverDate",
  avatar_url: "avatarUrl",
  response_mins: "responseMins",
  completed_deals: "completedDeals",
};

// DB-managed columns that should not be written back into the import file.
const DROP = new Set(["created_at", "updated_at", "agent"]);

function fromRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    if (DROP.has(k) || v === null) continue;
    out[SNAKE_TO_CAMEL[k] ?? k] = v;
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const activeOnly = args.includes("--active-only");
  const toStdout = args.includes("--stdout");
  const outFile = args.find((a) => !a.startsWith("--")) ?? "data/listings.export.json";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "✗ NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set in .env.local.",
    );
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let pq = sb.from("properties").select("*").order("listed_on", { ascending: false });
  if (activeOnly) pq = pq.eq("status", "active");
  const { data: props, error: pErr } = await pq;
  if (pErr) {
    console.error(`✗ Property fetch failed: ${pErr.message}`);
    process.exit(1);
  }

  const properties = (props ?? []).map(fromRow);

  // Pull only the agents actually referenced by the exported listings.
  const agentIds = [...new Set(properties.map((p) => p.agentId).filter(Boolean))];
  let agents = [];
  if (agentIds.length) {
    const { data: ags, error: aErr } = await sb.from("agents").select("*").in("id", agentIds);
    if (aErr) {
      console.error(`✗ Agent fetch failed: ${aErr.message}`);
      process.exit(1);
    }
    agents = (ags ?? []).map(fromRow);
  }

  const payload = { agents, properties };
  const json = JSON.stringify(payload, null, 2) + "\n";

  if (toStdout) {
    process.stdout.write(json);
    return;
  }

  const path = resolve(process.cwd(), outFile);
  writeFileSync(path, json, "utf8");
  console.log(
    `✓ Exported ${agents.length} agent(s) and ${properties.length} listing(s)` +
      `${activeOnly ? " (active only)" : ""} to ${outFile}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
