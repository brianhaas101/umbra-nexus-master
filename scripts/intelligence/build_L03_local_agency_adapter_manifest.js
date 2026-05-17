const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L03_local_agency_adapter_manifest.json";

const manifest = {
  version: "nexus_L03_local_agency_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
  adapters: [
    {
      adapter_id: "LOCAL_DIRECTORY_ADAPTER",
      input_type: "HTML_JSON_CSV",
      normalization_registry: "L03_local_agency_normalization.registry.json"
    },
    {
      adapter_id: "LOCAL_PROCUREMENT_ADAPTER",
      input_type: "HTML_RSS_JSON",
      normalization_registry: "L03_local_agency_normalization.registry.json"
    },
    {
      adapter_id: "LOCAL_BUDGET_ADAPTER",
      input_type: "PDF_HTML_XLSX",
      normalization_registry: "L03_local_agency_normalization.registry.json"
    },
    {
      adapter_id: "LOCAL_CRIME_DASHBOARD_ADAPTER",
      input_type: "JSON_API",
      normalization_registry: "L03_local_agency_normalization.registry.json"
    },
    {
      adapter_id: "LOCAL_PRESS_RELEASE_ADAPTER",
      input_type: "RSS_HTML",
      normalization_registry: "L03_local_agency_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L03 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
