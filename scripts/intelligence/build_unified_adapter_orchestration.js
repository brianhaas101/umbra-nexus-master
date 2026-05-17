const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/unified_adapter_orchestration.registry.json";

const adapters = [
  "L01_federal_adapter_manifest.json",
  "L02_state_adapter_manifest.json",
  "L03_local_agency_adapter_manifest.json",
  "L04_training_adapter_manifest.json",
  "L05_budget_adapter_manifest.json",
  "L06_behavioral_adapter_manifest.json",
  "L07_geographic_adapter_manifest.json",
  "L08_command_adapter_manifest.json",
  "L09_procurement_adapter_manifest.json",
  "L10_communication_adapter_manifest.json",
  "L11_incident_risk_adapter_manifest.json",
  "L12_engagement_adapter_manifest.json"
];

const registry = {
  version: "nexus_unified_adapter_orchestration_v1",
  generated_at: new Date().toISOString(),
  rule: "All adapters must register here before live ingestion execution.",
  adapter_manifest_count: adapters.length,
  manifests: adapters.map(file => ({
    file: `public/data/intelligence/runtime/${file}`,
    status: "REGISTERED"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[ADAPTER ORCHESTRATION] COMPLETE", registry.adapter_manifest_count);
