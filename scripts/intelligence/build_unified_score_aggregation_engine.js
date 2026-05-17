const fs = require("fs");
const path = require("path");

const FUSION = "public/data/intelligence/outputs/unified_entity_fusion_output.json";
const INDEX = "public/data/intelligence/outputs/unified_entity_intelligence_index.json";
const OUT = "public/data/intelligence/outputs/unified_score_aggregation.json";

const fusion = JSON.parse(fs.readFileSync(FUSION, "utf8"));
const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));

const scores = index.entities.map(e => {

  const comps =
    (fusion.score_components || []).filter(c => c.entity_id === e.entity_id);

  const total_weight =
    comps.reduce((s, c) => s + Number(c.weight || 0), 0);

  const weighted_total =
    comps.reduce((s, c) => s + Number(c.weighted_score || 0), 0);

  const final_score =
    total_weight > 0
      ? Math.round((weighted_total / total_weight) * 100) / 100
      : 0;

  return {
    entity_id: e.entity_id,
    display_name: e.display_name,
    state: e.state,
    component_count: comps.length,
    total_weight,
    weighted_total,
    final_score,
    components: comps
  };
});

const output = {
  version: "nexus_unified_score_aggregation_v1",
  generated_at: new Date().toISOString(),
  total_scored_entities: scores.length,
  scores
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[SCORE AGGREGATION] COMPLETE", output.total_scored_entities);
