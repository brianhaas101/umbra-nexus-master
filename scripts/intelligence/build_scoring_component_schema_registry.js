const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/scoring_component_schema.registry.json";

const registry = {
  version: "nexus_scoring_component_schema_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Every score component must be explainable, weighted, layer-bound, and evidence-backed.",
  required_fields: [
    "entity_id",
    "layer_id",
    "component_name",
    "component_score",
    "weight",
    "weighted_score",
    "reason",
    "source_trace",
    "confidence_score",
    "generated_at"
  ],
  score_bounds: {
    min: 0,
    max: 100
  },
  blocked_conditions: [
    "score_without_evidence",
    "score_out_of_bounds",
    "missing_weight",
    "missing_reason",
    "unregistered_layer_id"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SCORING COMPONENT SCHEMA] COMPLETE", registry.required_fields.length);
