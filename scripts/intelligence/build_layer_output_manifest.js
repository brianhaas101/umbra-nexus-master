const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/layer_output_manifest.json";

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

const manifest = {
  version: "nexus_layer_output_manifest_v1",
  generated_at: new Date().toISOString(),
  rule: "Every layer must produce entities, evidence, signals, score_components, and dossier_fields before runtime fusion.",
  outputs: layers.map(layer_id => ({
    layer_id,
    expected_outputs: [
      "entities",
      "evidence",
      "signals",
      "score_components",
      "dossier_fields"
    ],
    output_path: `public/data/intelligence/outputs/${layer_id}.normalized.json`,
    status: "OUTPUT_SHELL_REQUIRED"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[LAYER OUTPUT MANIFEST] COMPLETE", manifest.outputs.length);
