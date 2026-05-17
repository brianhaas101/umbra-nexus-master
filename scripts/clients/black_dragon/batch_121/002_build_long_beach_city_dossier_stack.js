const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const merged = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"),
  "utf8"
));

const dossiers = merged.merged_entities.map(entity => ({
  dossier_id:
    `BD_LB_CITY_DOSSIER_${String(entity.city_rank).padStart(5, "0")}`,

  city_runtime_entity_id:
    entity.city_runtime_entity_id,

  city_rank:
    entity.city_rank,

  organization_name:
    entity.organization_name,

  city:
    entity.city,

  state:
    entity.state,

  organization_types:
    entity.organization_types,

  source_layers:
    entity.source_layers,

  source_layer_count:
    entity.source_layer_count,

  priority_tier:
    entity.priority_tier,

  best_score:
    entity.best_score,

  max_book_sale_relevance:
    entity.max_book_sale_relevance,

  recommended_conversion_paths:
    entity.recommended_conversion_paths,

  recommended_actions:
    entity.recommended_actions,

  source_records:
    entity.source_records,

  dossier_visible:
    true,

  city_map_visible:
    true,

  contact_ready:
    false,

  automated_outreach_allowed:
    false,

  promotion_allowed:
    false,

  dossier_status:
    "CITY_DOSSIER_READY_FOR_CLIENT_REVIEW"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach/dossiers/long_beach_city_dossier_stack.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_city_dossier_stack_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CITY_DOSSIER_STACK_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
