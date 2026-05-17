const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L06_behavioral_scoring.registry.json";

const registry = {
  version: "nexus_L06_behavioral_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L06_BEHAVIORAL_ACTIVITY",
  scoring_outputs: [
    {
      score: "activity_pressure_score",
      description: "Current operational activity pressure around the entity or region"
    },
    {
      score: "behavioral_shift_index",
      description: "Detected change from baseline behavioral patterns"
    },
    {
      score: "operational_attention_score",
      description: "Likelihood the entity is focused on a relevant operational problem"
    },
    {
      score: "regional_escalation_score",
      description: "Likelihood of escalating regional activity"
    },
    {
      score: "market_relevance_activity_score",
      description: "Activity-driven relevance to client offering"
    }
  ],
  weighting_rules: {
    official_activity_weight: 0.30,
    frequency_weight: 0.20,
    severity_weight: 0.20,
    recency_weight: 0.20,
    regional_overlap_weight: 0.10
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L06 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
