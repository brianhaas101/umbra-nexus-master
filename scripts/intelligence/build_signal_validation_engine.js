const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/signal_validation_engine.registry.json";

const registry = {
  version: "nexus_signal_validation_engine_v1",
  generated_at: new Date().toISOString(),
  validation_rules: {
    layer_binding_required: true,
    evidence_backing_required: true,
    freshness_score_required: true,
    operational_relevance_required: true
  },
  validation_pipeline: [
    "SIGNAL_ID_PRESENT",
    "ENTITY_LINK_VALID",
    "LAYER_ID_VALID",
    "SIGNAL_CLASS_VALID",
    "SOURCE_TRACE_VALID",
    "CONFIDENCE_VALID",
    "FRESHNESS_VALID",
    "OPERATIONAL_RELEVANCE_VALID"
  ],
  rejection_conditions: [
    "missing_signal_id",
    "missing_entity_id",
    "invalid_layer_id",
    "missing_source_trace",
    "invalid_confidence_score"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SIGNAL VALIDATION ENGINE] COMPLETE", registry.validation_pipeline.length);
