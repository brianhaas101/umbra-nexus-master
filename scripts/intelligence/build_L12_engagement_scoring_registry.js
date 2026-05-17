const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L12_engagement_scoring.registry.json";

const registry = {
  version: "nexus_L12_engagement_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L12_ENGAGEMENT_RESPONSE",
  scoring_outputs: [
    {
      score: "engagement_probability",
      description: "Likelihood the entity will engage again"
    },
    {
      score: "response_quality_score",
      description: "Quality and usefulness of prior response"
    },
    {
      score: "conversion_likelihood",
      description: "Likelihood the entity moves toward purchase or adoption"
    },
    {
      score: "relationship_strength_score",
      description: "Strength of relationship based on interaction history"
    },
    {
      score: "follow_up_priority_score",
      description: "Priority level for next action"
    }
  ],
  weighting_rules: {
    positive_response_weight: 0.30,
    conversion_stage_weight: 0.25,
    recency_weight: 0.15,
    relationship_depth_weight: 0.15,
    follow_up_signal_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L12 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
