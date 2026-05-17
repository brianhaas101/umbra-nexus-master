const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const dossiers = runtime.merged_entities.map(entity => ({
  dossier_id:
    `BD_SD_DOSSIER_${String(entity.city_rank).padStart(5, "0")}`,

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
    `${entity.organization_name} is a San Diego motorcycle ecosystem candidate for Black Dragon propagation analysis.`,

  intelligence_fields: {
    influence_score:
      entity.estimated_influence_score,

    conversion_score:
      entity.estimated_conversion_score,

    cross_city_duplicate_detected:
      entity.cross_city_duplicate_detected,

    duplicate_resolution:
      entity.duplicate_resolution,

    source_layers:
      entity.source_layers
  },

  operational_status: {
    runtime_visible: true,
    contact_ready: false,
    manual_review_required: true,
    automated_outreach_allowed: false
  }
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/dossiers/san_diego_runtime_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_san_diego_runtime_dossiers_v1",

  generated_at:
    new Date().toISOString(),

  dossier_count:
    dossiers.length,

  dossiers
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_RUNTIME_DOSSIERS_COMPLETE",
  dossier_count: dossiers.length,
  output: out
}, null, 2));
