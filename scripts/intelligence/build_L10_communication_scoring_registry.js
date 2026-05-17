const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L10_communication_scoring.registry.json";

const registry = {
  version: "nexus_L10_communication_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L10_COMMUNICATION_INTELLIGENCE",
  scoring_outputs: [
    {
      score: "routing_efficiency_score",
      description: "How directly the contact path reaches the correct department or role"
    },
    {
      score: "contact_confidence_score",
      description: "Confidence that the contact path is valid and usable"
    },
    {
      score: "fallback_strength_score",
      description: "Strength of alternate routing if the primary path fails"
    },
    {
      score: "response_probability_score",
      description: "Likelihood the contact path results in a useful response"
    },
    {
      score: "outreach_readiness_score",
      description: "Overall readiness for outreach through communication paths"
    }
  ],
  weighting_rules: {
    verified_direct_contact_weight: 0.35,
    official_source_weight: 0.25,
    fallback_path_weight: 0.15,
    role_relevance_weight: 0.15,
    freshness_weight: 0.10
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L10 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
