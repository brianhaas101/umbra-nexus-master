const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/entity_validation_engine.registry.json";

const registry = {
  version: "nexus_entity_validation_engine_v1",
  generated_at: new Date().toISOString(),
  validation_rules: {
    stable_entity_id_required: true,
    canonical_name_required: true,
    source_trace_required: true,
    confidence_score_required: true,
    timestamp_required: true
  },
  validation_pipeline: [
    "ENTITY_ID_PRESENT",
    "ENTITY_TYPE_VALID",
    "CANONICAL_NAME_VALID",
    "LOCATION_VALID",
    "SOURCE_TRACE_VALID",
    "CONFIDENCE_VALID",
    "TIMESTAMP_VALID"
  ],
  rejection_conditions: [
    "missing_entity_id",
    "missing_canonical_name",
    "invalid_entity_type",
    "missing_source_trace",
    "duplicate_without_resolution"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[ENTITY VALIDATION ENGINE] COMPLETE", registry.validation_pipeline.length);
