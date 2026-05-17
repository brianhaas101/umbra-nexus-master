const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const BASELINE_INPUT = path.join(ROOT, "public/data/leads_master.json");
const BLACK_DRAGON_INPUT = path.join(ROOT, "public/data/clients/black_dragon/targets_with_dossiers.json");

const OUTPUT = path.join(ROOT, "public/data/clients/black_dragon/black_dragon_live_account.json");

function readJson(file) {
  let raw = fs.readFileSync(file, "utf8");

  if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
  }

  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function extractRows(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  return (
    raw.targets ||
    raw.leads ||
    raw.items ||
    raw.rows ||
    raw.data ||
    raw.records ||
    raw.results ||
    []
  );
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function rowKey(row, index, source) {
  const loc = row.location || {};
  const name = clean(row.name || row.agency_name || row.title || row.label);
  const city = clean(loc.city || row.city);
  const state = clean(loc.state || loc.region || row.state || row.region);
  const id = clean(row.id || row.entity_id || row.lead_id || row.master_id);

  return [
    source,
    id || index,
    name.toUpperCase(),
    city.toUpperCase(),
    state.toUpperCase()
  ].join("|");
}

function tagSource(row, sourceTag) {
  const tags = Array.isArray(row.tags) ? row.tags.slice() : [];

  if (!tags.includes(sourceTag)) tags.push(sourceTag);

  return {
    ...row,
    tags,
    _live_account_source: sourceTag
  };
}

function main() {
  console.log("[BD LIVE ACCOUNT] Starting...");

  if (!fs.existsSync(BASELINE_INPUT)) {
    console.error("[BD LIVE ACCOUNT] Missing baseline input: " + BASELINE_INPUT);
    process.exit(1);
  }

  if (!fs.existsSync(BLACK_DRAGON_INPUT)) {
    console.error("[BD LIVE ACCOUNT] Missing Black Dragon input: " + BLACK_DRAGON_INPUT);
    process.exit(1);
  }

  const baselineRaw = readJson(BASELINE_INPUT);
  const blackDragonRaw = readJson(BLACK_DRAGON_INPUT);

  const baselineRows = extractRows(baselineRaw).map((row) =>
    tagSource(row, "baseline_national_city_layer")
  );

  const blackDragonRows = extractRows(blackDragonRaw).map((row) =>
    tagSource(row, "black_dragon_agency_target")
  );

  const seen = new Set();
  const merged = [];

  for (let i = 0; i < baselineRows.length; i++) {
    const row = baselineRows[i];
    const key = rowKey(row, i, "BASELINE");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }

  for (let i = 0; i < blackDragonRows.length; i++) {
    const row = blackDragonRows[i];
    const key = rowKey(row, i, "BLACK_DRAGON");
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }

  const output = {
    source: "black_dragon_live_account",
    generated_at: new Date().toISOString(),
    note: "Live Black Dragon account file. Combines baseline national city layer with Black Dragon enriched agency targets.",
    baseline_count: baselineRows.length,
    black_dragon_target_count: blackDragonRows.length,
    total_count: merged.length,
    targets: merged
  };

  writeJson(OUTPUT, output);

  console.log("[BD LIVE ACCOUNT] Baseline:", baselineRows.length);
  console.log("[BD LIVE ACCOUNT] Black Dragon:", blackDragonRows.length);
  console.log("[BD LIVE ACCOUNT] Total:", merged.length);
  console.log("[BD LIVE ACCOUNT] Output:", OUTPUT);
}

main();
