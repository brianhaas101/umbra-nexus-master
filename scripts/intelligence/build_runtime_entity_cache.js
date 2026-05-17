const fs = require("fs");
const path = require("path");

const INDEX = "public/data/intelligence/outputs/unified_entity_intelligence_index.json";
const SCORES = "public/data/intelligence/outputs/unified_score_aggregation.json";
const OUT = "public/data/intelligence/runtime/runtime_entity_cache.json";

const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const scores = JSON.parse(fs.readFileSync(SCORES, "utf8"));

const scoreMap = new Map(
  scores.scores.map(s => [s.entity_id, s.final_score])
);

const cache = {
  version: "nexus_runtime_entity_cache_v1",
  generated_at: new Date().toISOString(),
  total_entities: index.entities.length,

  entities: index.entities.map(e => ({
    entity_id: e.entity_id,
    label: e.display_name,
    city: e.city,
    state: e.state,
    confidence_score: e.confidence_score,
    final_score: scoreMap.get(e.entity_id) || 0,
    runtime_status: "ACTIVE_LOCAL_LIVE_INTELLIGENCE"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(cache, null, 2));

console.log("[RUNTIME ENTITY CACHE] COMPLETE", cache.total_entities);
