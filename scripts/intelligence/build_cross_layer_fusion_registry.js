const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/cross_layer_fusion.registry.json";

const registry = {
  version: "nexus_cross_layer_fusion_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Fusion outputs must be explainable through source ? evidence ? normalized signal ? scoring component ? operational output.",
  fusion_modes: [
    {
      fusion_id: "AUTHORITY_PLUS_TRAINING",
      layers: ["L02_STATE_INTELLIGENCE", "L04_TRAINING_INFRASTRUCTURE", "L08_COMMAND_STRUCTURE"],
      output: "training_decision_readiness",
      purpose: "Identify agencies with structural authority and training relevance."
    },
    {
      fusion_id: "BUDGET_PLUS_PROCUREMENT",
      layers: ["L05_BUDGET_AND_FUNDING", "L09_PROCUREMENT_INTELLIGENCE"],
      output: "purchase_window_probability",
      purpose: "Estimate whether the entity can buy and when."
    },
    {
      fusion_id: "RISK_PLUS_BEHAVIOR",
      layers: ["L06_BEHAVIORAL_ACTIVITY", "L11_INCIDENT_AND_RISK"],
      output: "operational_pressure",
      purpose: "Detect rising operational need or urgency."
    },
    {
      fusion_id: "GEO_PLUS_INCIDENT",
      layers: ["L07_GEOGRAPHIC_TERRITORY", "L11_INCIDENT_AND_RISK"],
      output: "regional_risk_cluster",
      purpose: "Map spatial concentration of operational pressure."
    },
    {
      fusion_id: "COMMUNICATION_PLUS_ENGAGEMENT",
      layers: ["L10_COMMUNICATION_INTELLIGENCE", "L12_ENGAGEMENT_RESPONSE"],
      output: "contact_conversion_probability",
      purpose: "Estimate whether contact pathways are likely to convert."
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[CROSS-LAYER FUSION] COMPLETE", registry.fusion_modes.length);
