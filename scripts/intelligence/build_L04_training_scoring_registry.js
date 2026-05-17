const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L04_training_scoring.registry.json";

const registry = {
  version: "nexus_L04_training_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L04_TRAINING_INFRASTRUCTURE",
  scoring_outputs: [
    { score: "training_purchase_probability", description: "Likelihood training spend is viable" },
    { score: "certification_pressure_score", description: "Pressure created by mandates or required continuing education" },
    { score: "academy_dependency_score", description: "Dependency on academy or training provider infrastructure" },
    { score: "training_cycle_timing_score", description: "Likelihood the entity is near a training purchase or schedule window" },
    { score: "specialized_training_fit_score", description: "Fit between client offering and observed training needs" }
  ],
  weighting_rules: {
    mandated_training_weight: 0.25,
    academy_presence_weight: 0.20,
    schedule_recency_weight: 0.20,
    provider_authority_weight: 0.20,
    specialization_fit_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L04 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
