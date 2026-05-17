const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const classifiedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/exports/classified_city_inventory.json"
);

const classified = JSON.parse(fs.readFileSync(classifiedPath, "utf8"));

const clean = classified.rows
  .filter(r => r.purge_classification === "REAL_LEANING_KEEP_FOR_EXPANSION_REVIEW")
  .map((row, index) => ({
    clean_seed_id:
      `BD_CLEAN_EXPANSION_SEED_${String(index + 1).padStart(6, "0")}`,

    organization_or_city_name:
      row.normalized_name,

    state:
      row.normalized_state,

    lat:
      row.lat,

    lon:
      row.lon,

    source_file:
      row.source_file,

    source_classification:
      "REAL_LEANING_REQUIRES_SOURCE_VERIFICATION",

    target_expansion_allowed:
      true,

    contact_ready:
      false,

    verified_contact_route_status:
      "NOT_VERIFIED",

    dossier_visible:
      false,

    city_map_visible:
      false,

    automated_outreach_allowed:
      false,

    promotion_allowed:
      false
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/exports/clean_black_dragon_expansion_seed.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_clean_expansion_seed_v1",
  generated_at: new Date().toISOString(),
  total_clean_expansion_seeds: clean.length,
  clean_expansion_seeds: clean
}, null, 2));

console.log(JSON.stringify({
  status: "CLEAN_EXPANSION_SEED_EXPORT_COMPLETE",
  total_clean_expansion_seeds: clean.length,
  output: out
}, null, 2));
