const fs = require("fs");

const INPUT = "public/data/clients/black_dragon/normalized_intelligence_outputs.json";
const OUTPUT = "public/data/clients/black_dragon/scoring_export_bridge.json";

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const exportData = {
  version: "black_dragon_scoring_export_bridge_v1",
  generated_at: new Date().toISOString(),

  scores: data.score_components.map(s => ({
    entity_id: s.entity_id,
    layer_id: s.layer_id,
    component_name: s.component_name,
    component_score: s.component_score,
    weight: s.weight,
    weighted_score: Math.round(s.component_score * s.weight)
  }))
};

fs.writeFileSync(OUTPUT, JSON.stringify(exportData, null, 2));

console.log("[SCORING EXPORT] COMPLETE");
console.log("[SCORING EXPORT] Scores:", exportData.scores.length);
