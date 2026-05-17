const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const dossiers = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/organization_import/dossiers/long_beach_ranked_dossiers.json"),
  "utf8"
));

const nodes = dossiers.dossiers.map((dossier, index) => ({
  runtime_target_id: `BD_LONGBEACH_RUNTIME_${String(index + 1).padStart(5, "0")}`,
  entity_id: dossier.organization_registry_id,
  dossier_id: dossier.dossier_id,
  organization_name: dossier.organization_name,
  city: dossier.city,
  state: dossier.state,
  country: "USA",
  organization_type: dossier.organization_type,
  city_rank: dossier.city_rank,
  priority_tier: dossier.priority_tier,
  composite_rank_score: dossier.composite_rank_score,
  verified_source_status: "VERIFIED_PUBLIC_SOURCE",
  verified_contact_route_status: dossier.contact_route_status,
  dossier_visible: true,
  city_map_visible: true,
  contact_ready: false,
  engagement_state: "NO_CONTACT_ACTIVITY",
  automated_outreach_allowed: false,
  promotion_allowed: false,
  runtime_visibility_allowed: true
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_import/runtime/long_beach_runtime_map_nodes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_runtime_map_nodes_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_runtime_nodes: nodes.length,
  runtime_nodes: nodes
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RUNTIME_MAP_NODES_COMPLETE",
  total_runtime_nodes: nodes.length,
  output: out
}, null, 2));
