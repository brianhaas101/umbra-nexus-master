const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const dossierStack = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach/dossiers/long_beach_city_dossier_stack.json"),
  "utf8"
));

const nodes = dossierStack.dossiers.map((d, index) => ({
  map_node_id:
    `BD_LB_MAP_NODE_${String(index + 1).padStart(5, "0")}`,

  city_runtime_entity_id:
    d.city_runtime_entity_id,

  dossier_id:
    d.dossier_id,

  organization_name:
    d.organization_name,

  city:
    d.city,

  state:
    d.state,

  country:
    "USA",

  lat:
    33.7701,

  lon:
    -118.1937,

  map_layer:
    "BLACK_DRAGON_BOOK_SALES_CITY_RUNTIME",

  node_rank:
    d.city_rank,

  priority_tier:
    d.priority_tier,

  score:
    d.best_score,

  source_layer_count:
    d.source_layer_count,

  contact_ready:
    false,

  city_map_visible:
    true,

  dossier_visible:
    true,

  automated_outreach_allowed:
    false,

  node_status:
    "VISIBLE_CLIENT_REVIEW_ONLY"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach/map_nodes/long_beach_map_node_manifest.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_map_node_manifest_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_map_nodes: nodes.length,
  map_nodes: nodes
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_MAP_NODE_MANIFEST_COMPLETE",
  total_map_nodes: nodes.length,
  output: out
}, null, 2));
