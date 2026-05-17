const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L09_procurement_scoring.registry.json";

const registry = {
  version: "nexus_L09_procurement_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L09_PROCUREMENT_INTELLIGENCE",
  scoring_outputs: [
    { score: "procurement_probability", description: "Likelihood the entity can purchase through a known path" },
    { score: "vendor_cycle_position", description: "Where the entity sits in the active buying cycle" },
    { score: "approval_complexity_score", description: "Difficulty of approval and vendor onboarding" },
    { score: "contract_opportunity_score", description: "Strength of visible procurement opportunity" },
    { score: "purchase_timing_score", description: "Likelihood of near-term purchase timing" }
  ],
  weighting_rules: {
    active_bid_weight: 0.30,
    historical_purchase_weight: 0.20,
    vendor_registration_weight: 0.15,
    approval_path_weight: 0.20,
    timing_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L09 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
