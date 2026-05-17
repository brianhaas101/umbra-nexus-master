const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/adapter_framework.registry.json";

const registry = {
  version: "nexus_adapter_framework_registry_v1",
  generated_at: new Date().toISOString(),
  rules: {
    deterministic_adapters_required: true,
    source_specific_normalization_required: true,
    runtime_registration_required: true,
    audit_logging_required: true,
    unsupported_source_rejection_enabled: true
  },
  adapter_types: [
    {
      adapter_id: "FEDERAL_API_ADAPTER",
      supported_layers: ["L01_FEDERAL_INTELLIGENCE"],
      supports_json: true,
      supports_csv: true,
      supports_xml: true
    },
    {
      adapter_id: "STATE_PORTAL_ADAPTER",
      supported_layers: ["L02_STATE_INTELLIGENCE"],
      supports_json: true,
      supports_html: true,
      supports_csv: true
    },
    {
      adapter_id: "LOCAL_AGENCY_ADAPTER",
      supported_layers: ["L03_LOCAL_AGENCY_INTELLIGENCE"],
      supports_html: true,
      supports_directory_resolution: true
    },
    {
      adapter_id: "GIS_SPATIAL_ADAPTER",
      supported_layers: ["L07_GEOGRAPHIC_TERRITORY"],
      supports_geojson: true,
      supports_geocoding: true,
      supports_spatial_indexing: true
    },
    {
      adapter_id: "PROCUREMENT_ADAPTER",
      supported_layers: ["L05_BUDGET_AND_FUNDING","L09_PROCUREMENT_INTELLIGENCE"],
      supports_bid_parsing: true,
      supports_contract_resolution: true
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[ADAPTER FRAMEWORK REGISTRY] COMPLETE", registry.adapter_types.length);
