const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/live_connector_implementation.registry.json";

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
  version: "nexus_live_connector_implementation_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "This registry tracks implementation readiness. It does not imply live source pulling is complete.",
  total_layers: layers.length,
  connectors: layers.map(layer_id => ({
    layer_id,
    implementation_status: "CONNECTOR_STUB_READY",
    live_pull_enabled: false,
    validation_required_before_runtime: true,
    output_path: `public/data/intelligence/outputs/${layer_id}.normalized.json`
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[LIVE CONNECTOR REGISTRY] COMPLETE", registry.total_layers);
