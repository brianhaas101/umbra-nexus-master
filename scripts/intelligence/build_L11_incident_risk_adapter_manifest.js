const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L11_incident_risk_adapter_manifest.json";

const manifest = {
  version: "nexus_L11_incident_risk_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L11_INCIDENT_AND_RISK",
  adapters: [
    {
      adapter_id: "CRIME_DATA_ADAPTER",
      input_type: "CSV_JSON_API",
      normalization_registry: "L11_incident_risk_normalization.registry.json"
    },
    {
      adapter_id: "INCIDENT_DASHBOARD_ADAPTER",
      input_type: "JSON_HTML",
      normalization_registry: "L11_incident_risk_normalization.registry.json"
    },
    {
      adapter_id: "EMERGENCY_ALERT_ADAPTER",
      input_type: "RSS_JSON_EMAIL",
      normalization_registry: "L11_incident_risk_normalization.registry.json"
    },
    {
      adapter_id: "WEATHER_RISK_ADAPTER",
      input_type: "API_JSON",
      normalization_registry: "L11_incident_risk_normalization.registry.json"
    },
    {
      adapter_id: "MEDIA_ESCALATION_ADAPTER",
      input_type: "RSS_HTML",
      normalization_registry: "L11_incident_risk_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L11 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
