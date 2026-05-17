const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const merged = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
  "utf8"
));

const summary = {
  version: "black_dragon_long_beach_final_runtime_summary_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  totals: {
    raw_layer_rows: merged.raw_layer_rows,
    deduped_city_entities: merged.deduped_city_entities,
    contact_ready_entities: merged.contact_ready_entities,
    hot: merged.merged_entities.filter(e => e.priority_tier === "HOT").length,
    warm: merged.merged_entities.filter(e => e.priority_tier === "WARM").length,
    review: merged.merged_entities.filter(e => e.priority_tier === "REVIEW").length,
    automated_outreach_allowed: merged.merged_entities.filter(e => e.automated_outreach_allowed).length
  },
  top_20: merged.merged_entities.slice(0, 20).map(e => ({
    city_rank: e.city_rank,
    organization_name: e.organization_name,
    priority_tier: e.priority_tier,
    best_score: e.best_score,
    source_layer_count: e.source_layer_count,
    contact_ready: e.contact_ready
  })),
  usage_state: {
    client_can_view_city_map: true,
    client_can_open_dossiers: true,
    client_can_manually_act_on_contact_ready_targets: true,
    contact_ready_requires_verified_public_route: true,
    automated_outreach_allowed: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach_final/long_beach_final_runtime_summary.json"
);

fs.writeFileSync(out, JSON.stringify(summary, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_FINAL_RUNTIME_SUMMARY_COMPLETE",
  totals: summary.totals,
  output: out
}, null, 2));
