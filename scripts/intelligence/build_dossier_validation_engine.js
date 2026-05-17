const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/dossier_validation_engine.registry.json";

const registry = {
  version: "nexus_dossier_validation_engine_v1",
  generated_at: new Date().toISOString(),
  validation_rules: {
    field_group_required: true,
    evidence_trace_required: true,
    freshness_score_required: true,
    layer_binding_required: true
  },
  validation_pipeline: [
    "ENTITY_ID_VALID",
    "FIELD_GROUP_VALID",
    "FIELD_NAME_VALID",
    "SOURCE_TRACE_VALID",
    "CONFIDENCE_VALID",
    "FRESHNESS_VALID",
    "LAYER_ID_VALID"
  ],
  rejection_conditions: [
    "missing_entity_id",
    "missing_field_group",
    "missing_source_trace",
    "unsupported_field_group",
    "unverified_recommendation"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[DOSSIER VALIDATION ENGINE] COMPLETE", registry.validation_pipeline.length);
