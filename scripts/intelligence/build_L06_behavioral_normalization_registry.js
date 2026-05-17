const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L06_behavioral_normalization.registry.json";

const registry = {
  version: "nexus_L06_behavioral_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L06_BEHAVIORAL_ACTIVITY",
  normalization_rules: {
    event_time_required: true,
    geographic_context_required: true,
    source_trace_required: true,
    entity_linking_required: true,
    sentiment_classification_supported: true,
    duplicate_event_resolution_required: true
  },
  normalized_fields: [
    "activity_type",
    "activity_date",
    "activity_location",
    "involved_entity",
    "related_agency",
    "activity_severity",
    "activity_frequency",
    "behavioral_shift",
    "regional_pressure",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_activity_date",
    "missing_source_trace",
    "unlinked_entity",
    "duplicate_unresolved_event",
    "unsupported_activity_type"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L06 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
