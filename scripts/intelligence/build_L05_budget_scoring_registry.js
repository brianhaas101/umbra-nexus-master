const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L05_budget_scoring.registry.json";

const registry = {
  version: "nexus_L05_budget_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L05_BUDGET_AND_FUNDING",
  scoring_outputs: [
    {
      score: "budget_capacity_score",
      description: "Ability to absorb operational purchases"
    },
    {
      score: "grant_probability_score",
      description: "Likelihood of available grant pathways"
    },
    {
      score: "procurement_window_score",
      description: "Likelihood entity is entering active spending cycle"
    },
    {
      score: "financial_stability_score",
      description: "Financial resilience and consistency"
    },
    {
      score: "training_funding_score",
      description: "Likelihood training purchases are viable"
    }
  ],
  weighting_rules: {
    federal_grants_weight: 0.30,
    local_budget_weight: 0.25,
    procurement_activity_weight: 0.20,
    training_spending_weight: 0.15,
    fiscal_stability_weight: 0.10
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L05 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
