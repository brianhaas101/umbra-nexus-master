const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtime = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
  "utf8"
));

const now = new Date();

const freshness = runtime.merged_entities.map(e => {
  const layerCount = Number(e.source_layer_count || 1);
  const baseFreshness = Math.min(1, 0.65 + layerCount * 0.06);

  return {
    city_runtime_entity_id: e.city_runtime_entity_id,
    organization_name: e.organization_name,
    city_rank: e.city_rank,
    priority_tier: e.priority_tier,
    source_layer_count: layerCount,
    contact_ready: e.contact_ready,
    last_seen_at: now.toISOString(),
    last_verified_at: e.contact_ready ? now.toISOString() : null,
    signal_age_days: 0,
    freshness_score: Number(baseFreshness.toFixed(2)),
    stale_status: "FRESH",
    revalidation_required: false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/simulation/freshness/long_beach_freshness_snapshot.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_freshness_snapshot_v1",
  generated_at: now.toISOString(),
  total_entities: freshness.length,
  freshness
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_FRESHNESS_SNAPSHOT_COMPLETE",
  total_entities: freshness.length,
  output: out
}, null, 2));
