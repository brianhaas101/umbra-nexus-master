const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L07_geographic_adapter_manifest.json";

const manifest = {
  version: "nexus_L07_geographic_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L07_GEOGRAPHIC_TERRITORY",
  adapters: [
    {
      adapter_id: "HIFLD_GEO_ADAPTER",
      input_type: "GEOJSON_CSV_API",
      normalization_registry: "L07_geographic_normalization.registry.json"
    },
    {
      adapter_id: "STATE_GIS_ADAPTER",
      input_type: "SHAPEFILE_GEOJSON",
      normalization_registry: "L07_geographic_normalization.registry.json"
    },
    {
      adapter_id: "CITY_GIS_ADAPTER",
      input_type: "GEOJSON_HTML",
      normalization_registry: "L07_geographic_normalization.registry.json"
    },
    {
      adapter_id: "TRANSPORTATION_NETWORK_ADAPTER",
      input_type: "API_JSON_GEOJSON",
      normalization_registry: "L07_geographic_normalization.registry.json"
    },
    {
      adapter_id: "HEATMAP_CLUSTER_ADAPTER",
      input_type: "CSV_JSON",
      normalization_registry: "L07_geographic_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L07 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
