const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/scoring_orchestration.registry.json";

const registry = {
  version: "nexus_scoring_orchestration_registry_v1",
  generated_at: new Date().toISOString(),
  scoring_rules: {
    explainable_scoring_required: true,
    evidence_backing_required: true,
    cross_layer_fusion_enabled: true,
    confidence_weighting_enabled: true,
    freshness_weighting_enabled: true
  },
  layers: [
    { layer_id:"L01_FEDERAL_INTELLIGENCE", operational_weight:1.0 },
    { layer_id:"L02_STATE_INTELLIGENCE", operational_weight:0.95 },
    { layer_id:"L03_LOCAL_AGENCY_INTELLIGENCE", operational_weight:0.9 },
    { layer_id:"L04_TRAINING_INFRASTRUCTURE", operational_weight:0.85 },
    { layer_id:"L05_BUDGET_AND_FUNDING", operational_weight:0.85 },
    { layer_id:"L06_BEHAVIORAL_ACTIVITY", operational_weight:0.8 },
    { layer_id:"L07_GEOGRAPHIC_TERRITORY", operational_weight:0.8 },
    { layer_id:"L08_COMMAND_STRUCTURE", operational_weight:0.8 },
    { layer_id:"L09_PROCUREMENT_INTELLIGENCE", operational_weight:0.85 },
    { layer_id:"L10_COMMUNICATION_INTELLIGENCE", operational_weight:0.75 },
    { layer_id:"L11_INCIDENT_AND_RISK", operational_weight:0.9 },
    { layer_id:"L12_ENGAGEMENT_RESPONSE", operational_weight:0.75 }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SCORING ORCHESTRATION REGISTRY] COMPLETE", registry.layers.length);
