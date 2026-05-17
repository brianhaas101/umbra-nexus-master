const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const inputPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/nexus_city_inventory_for_black_dragon_expansion.json"
);

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rows = Array.isArray(raw) ? raw : [];

const normalized = rows.map((row, index) => ({
  purge_row_id:
    `BD_PURGE_ROW_${String(index + 1).padStart(6, "0")}`,

  original_city:
    row.city || null,

  original_state:
    row.state || null,

  lat:
    row.lat || null,

  lon:
    row.lon || null,

  source_file:
    row.source_file || null,

  normalized_name:
    String(row.city || "").trim(),

  normalized_state:
    String(row.state || "").trim(),

  purge_classification:
    "UNCLASSIFIED",

  purge_reasons:
    []
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/inputs/normalized_city_inventory_for_purge.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_normalized_city_inventory_for_purge_v1",
  generated_at: new Date().toISOString(),
  total_rows: normalized.length,
  rows: normalized
}, null, 2));

console.log(JSON.stringify({
  status: "NORMALIZE_CITY_INVENTORY_FOR_PURGE_COMPLETE",
  total_rows: normalized.length,
  output: out
}, null, 2));
