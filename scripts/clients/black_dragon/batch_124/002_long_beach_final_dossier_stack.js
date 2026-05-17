const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const merged = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
  "utf8"
));

const dossiers = merged.merged_entities.map(e => ({
  dossier_id: `BD_LB_FINAL_DOSSIER_${String(e.city_rank).padStart(5, "0")}`,
  city_runtime_entity_id: e.city_runtime_entity_id,
  city_rank: e.city_rank,
  organization_name: e.organization_name,
  city: e.city,
  state: e.state,
  priority_tier: e.priority_tier,
  best_score: e.best_score,
  max_book_sale_relevance: e.max_book_sale_relevance,
  source_layer_count: e.source_layer_count,
  source_layers: e.source_layers,
  organization_types: e.organization_types,
  recommended_conversion_paths: e.recommended_conversion_paths,
  recommended_actions: e.recommended_actions,
  source_records: e.source_records,
  contact_ready: e.contact_ready,
  client_action_available: e.client_action_available,
  public_contact_url: e.public_contact_url,
  contact_route_type: e.contact_route_type,
  outreach_execution_status: e.outreach_execution_status,
  dossier_visible: true,
  city_map_visible: true,
  automated_outreach_allowed: false,
  dossier_status: "FINAL_CITY_DOSSIER_READY"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach_final/dossiers/long_beach_final_city_dossier_stack.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_final_city_dossier_stack_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_FINAL_DOSSIER_STACK_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
