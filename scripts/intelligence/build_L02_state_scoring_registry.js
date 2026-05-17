const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L02_state_scoring.registry.json";

const registry = {
  version: "nexus_L02_state_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L02_STATE_INTELLIGENCE",
  scoring_outputs: [
    {
      score: "state_operational_pressure_score",
      description: "Operational activity and pressure at state level"
    },
    {
      score: "state_regulatory_alignment_score",
      description: "Alignment with state policy and regulatory movement"
    },
    {
      score: "state_training_relevance_score",
      description: "Training demand and certification relevance"
    },
    {
      score: "state_procurement_relevance_score",
      description: "Likelihood of procurement activity within the state"
    },
    {
      score: "state_intelligence_confidence_score",
      description: "Confidence in aggregated state-level intelligence"
    }
  ],
  weighting_rules: {
    state_authority_weight: 0.30,
    operational_activity_weight: 0.20,
    training_activity_weight: 0.20,
    procurement_activity_weight: 0.15,
    recency_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L02 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
