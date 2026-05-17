const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/layer_source_catalog_index.json";

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

const index = {
  version: "nexus_layer_source_catalog_index_v1",
  generated_at: new Date().toISOString(),
  rule: "Every layer must maintain a source catalog with minimum 15 source classes before full production status.",
  minimum_sources_per_layer: 15,
  layers: layers.map(layer_id => ({
    layer_id,
    catalog_required: true,
    production_ready: false,
    source_catalog_path: `public/data/intelligence/sources/${layer_id}.sources.json`
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(index, null, 2));

console.log("[SOURCE CATALOG INDEX] COMPLETE", index.layers.length);
