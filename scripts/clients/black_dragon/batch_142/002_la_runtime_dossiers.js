const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const dossiers = runtime.merged_entities.map(entity => ({
  dossier_id:
    `BD_LA_DOSSIER_${String(entity.city_rank).padStart(5, "0")}`,

  city_runtime_entity_id:
    entity.city_runtime_entity_id,

  organization_name:
    entity.organization_name,

  city_rank:
    entity.city_rank,

  priority_tier:
    entity.priority_tier,

  best_score:
    entity.best_score,

  city:
    entity.city,

  state:
    entity.state,

  summary:
    `${entity.organization_name} is a Los Angeles ${entity.organization_type} candidate identified for Black Dragon book-sale propagation and manual review.`,

  intelligence_fields: {
    estimated_influence_score:
      entity.estimated_influence_score,

    estimated_conversion_score:
      entity.estimated_conversion_score,

    cross_city_duplicate_detected:
      entity.cross_city_duplicate_detected,

    duplicate_resolution:
      entity.duplicate_resolution,

    founder_review_required:
      entity.founder_review_required,

    source_layers:
      entity.source_layers,

    source_records:
      entity.source_records
  },

  operational_status: {
    dossier_visible:
      true,

    runtime_visible:
      true,

    contact_ready:
      false,

    automated_outreach_allowed:
      false,

    manual_review_required:
      true
  }
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/dossiers/los_angeles_runtime_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_los_angeles_runtime_dossiers_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Los Angeles",

  state:
    "CA",

  dossier_count:
    dossiers.length,

  dossiers
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_DOSSIERS_COMPLETE",
  dossier_count: dossiers.length,
  output: out
}, null, 2));
