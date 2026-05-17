const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const merged = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"),
  "utf8"
));

const dossiers = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach/dossiers/long_beach_city_dossier_stack.json"),
  "utf8"
));

const nodes = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach/map_nodes/long_beach_map_node_manifest.json"),
  "utf8"
));

const summary = {
  version:
    "black_dragon_long_beach_city_runtime_summary_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  state:
    "CA",

  totals: {
    raw_layer_rows:
      merged.raw_layer_rows,

    deduped_city_entities:
      merged.deduped_city_entities,

    city_dossiers:
      dossiers.total_dossiers,

    map_nodes:
      nodes.total_map_nodes,

    hot:
      merged.merged_entities.filter(e => e.priority_tier === "HOT").length,

    warm:
      merged.merged_entities.filter(e => e.priority_tier === "WARM").length,

    review:
      merged.merged_entities.filter(e => e.priority_tier === "REVIEW").length,

    contact_ready:
      merged.merged_entities.filter(e => e.contact_ready).length
  },

  top_10:
    merged.merged_entities.slice(0, 10).map(e => ({
      rank: e.city_rank,
      organization_name: e.organization_name,
      priority_tier: e.priority_tier,
      best_score: e.best_score,
      source_layer_count: e.source_layer_count,
      source_layers: e.source_layers
    })),

  usage_state: {
    client_can_view_on_city_map: true,
    client_can_open_dossiers: true,
    client_can_mark_for_review: true,
    client_can_contact_now: false,
    automated_outreach_allowed: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach/long_beach_city_runtime_summary.json"
);

fs.writeFileSync(out, JSON.stringify(summary, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RUNTIME_SUMMARY_COMPLETE",
  totals: summary.totals,
  output: out
}, null, 2));
