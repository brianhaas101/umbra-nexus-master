const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/runtime_manifest.registry.json";

const layers = [
  "L01_FEDERAL_INTELLIGENCE","L02_STATE_INTELLIGENCE","L03_LOCAL_AGENCY_INTELLIGENCE",
  "L04_TRAINING_INFRASTRUCTURE","L05_BUDGET_AND_FUNDING","L06_BEHAVIORAL_ACTIVITY",
  "L07_GEOGRAPHIC_TERRITORY","L08_COMMAND_STRUCTURE","L09_PROCUREMENT_INTELLIGENCE",
  "L10_COMMUNICATION_INTELLIGENCE","L11_INCIDENT_AND_RISK","L12_ENGAGEMENT_RESPONSE"
];

const registry = {
  version: "nexus_runtime_manifest_registry_v1",
  generated_at: new Date().toISOString(),
  runtime_rules: {
    runtime_registration_required: true,
    deterministic_execution_required: true,
    layer_isolation_required: true,
    cross_layer_fusion_allowed: true,
    audit_logging_required: true
  },
  runtime_manifests: layers.map(layer_id => ({
    layer_id,
    supports_geospatial: ["L01_FEDERAL_INTELLIGENCE","L02_STATE_INTELLIGENCE","L03_LOCAL_AGENCY_INTELLIGENCE","L06_BEHAVIORAL_ACTIVITY","L07_GEOGRAPHIC_TERRITORY","L11_INCIDENT_AND_RISK"].includes(layer_id),
    supports_dossiers: true,
    supports_scoring: true,
    supports_runtime_alerts: !["L08_COMMAND_STRUCTURE","L10_COMMUNICATION_INTELLIGENCE"].includes(layer_id)
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[RUNTIME MANIFEST REGISTRY] COMPLETE", registry.runtime_manifests.length);
