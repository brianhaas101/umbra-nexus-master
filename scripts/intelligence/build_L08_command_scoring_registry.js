const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L08_command_scoring.registry.json";

const registry = {
  version: "nexus_L08_command_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L08_COMMAND_STRUCTURE",
  scoring_outputs: [
    {
      score: "decision_authority_score",
      description: "Likelihood this role or entity controls decisions"
    },
    {
      score: "training_authority_score",
      description: "Likelihood this role controls or influences training"
    },
    {
      score: "procurement_influence_score",
      description: "Likelihood this role influences purchases"
    },
    {
      score: "routing_authority_score",
      description: "Likelihood this role can route to the correct decision-maker"
    },
    {
      score: "command_confidence_score",
      description: "Confidence in mapped command hierarchy"
    }
  ],
  weighting_rules: {
    official_org_chart_weight: 0.30,
    title_rank_weight: 0.20,
    training_role_weight: 0.20,
    procurement_role_weight: 0.15,
    recency_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L08 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
