const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/master_layer_registry.json";

const layers = [
  "L01_FEDERAL_INTELLIGENCE",
  "L02_STATE_INTELLIGENCE",
  "L03_LOCAL_AGENCY_INTELLIGENCE",
  "L04_TRAINING_INFRASTRUCTURE",
  "L05_BUDGET_AND_FUNDING",
  "L06_BEHAVIORAL_ACTIVITY",
  "L07_GEOGRAPHIC_TERRITORY",
  "L08_COMMAND_STRUCTURE",
  "L09_PROCUREMENT_INTELLIGENCE",
  "L10_COMMUNICATION_INTELLIGENCE",
  "L11_INCIDENT_AND_RISK",
  "L12_ENGAGEMENT_RESPONSE"
];

const registry = {
  version: "nexus_master_layer_registry_v1",
  generated_at: new Date().toISOString(),
  total_layers: layers.length,
  layers: layers.map(layer_id => ({
    layer_id,
    source_catalog: `public/data/intelligence/sources/${layer_id}.sources.json`,
    production_ready: true
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[MASTER LAYER REGISTRY] COMPLETE", registry.total_layers);
