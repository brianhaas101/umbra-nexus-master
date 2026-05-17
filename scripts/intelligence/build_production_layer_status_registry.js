const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/production_layer_status.registry.json";

const registry = {
  version: "nexus_production_layer_status_registry_v1",
  generated_at: new Date().toISOString(),
  production_layers: [
    "L05_BUDGET_AND_FUNDING",
    "L06_BEHAVIORAL_ACTIVITY",
    "L08_COMMAND_STRUCTURE",
    "L09_PROCUREMENT_INTELLIGENCE",
    "L11_INCIDENT_AND_RISK"
  ],
  partial_layers: [
    "L01_FEDERAL_INTELLIGENCE",
    "L02_STATE_INTELLIGENCE",
    "L03_LOCAL_AGENCY_INTELLIGENCE",
    "L04_TRAINING_INFRASTRUCTURE",
    "L07_GEOGRAPHIC_TERRITORY",
    "L10_COMMUNICATION_INTELLIGENCE",
    "L12_ENGAGEMENT_RESPONSE"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[PRODUCTION STATUS] COMPLETE", registry.production_layers.length);
