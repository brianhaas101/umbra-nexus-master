const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/scoring_validation_engine.registry.json";

const registry = {
  version: "nexus_scoring_validation_engine_v1",
  generated_at: new Date().toISOString(),
  validation_rules: {
    explainable_reason_required: true,
    evidence_backing_required: true,
    weight_required: true,
    bounded_score_required: true
  },
  validation_pipeline: [
    "ENTITY_ID_VALID",
    "LAYER_ID_VALID",
    "COMPONENT_NAME_VALID",
    "SCORE_BOUNDS_VALID",
    "WEIGHT_VALID",
    "WEIGHTED_SCORE_VALID",
    "SOURCE_TRACE_VALID",
    "CONFIDENCE_VALID",
    "REASON_PRESENT"
  ],
  rejection_conditions: [
    "score_without_reason",
    "score_without_source_trace",
    "score_out_of_bounds",
    "missing_weight",
    "invalid_layer_binding"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SCORING VALIDATION ENGINE] COMPLETE", registry.validation_pipeline.length);
