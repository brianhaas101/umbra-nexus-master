const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L01_federal_adapter_manifest.json";

const manifest = {
  version: "nexus_L01_federal_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01_FEDERAL_INTELLIGENCE",
  adapters: [
    { adapter_id: "FBI_CRIME_DATA_API_ADAPTER", input_type: "API_JSON", normalization_registry: "L01_federal_normalization.registry.json" },
    { adapter_id: "FEDERAL_PRESS_RELEASE_RSS_ADAPTER", input_type: "RSS_HTML", normalization_registry: "L01_federal_normalization.registry.json" },
    { adapter_id: "USA_SPENDING_API_ADAPTER", input_type: "API_JSON", normalization_registry: "L01_federal_normalization.registry.json" },
    { adapter_id: "SAM_GOV_API_ADAPTER", input_type: "API_JSON", normalization_registry: "L01_federal_normalization.registry.json" },
    { adapter_id: "HIFLD_GIS_ADAPTER", input_type: "GEOJSON_CSV_API", normalization_registry: "L01_federal_normalization.registry.json" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L01 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
