const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L04_training_normalization.registry.json";

const registry = {
  version: "nexus_L04_training_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L04_TRAINING_INFRASTRUCTURE",
  normalization_rules: {
    training_program_required: true,
    provider_or_agency_required: true,
    training_category_required: true,
    schedule_or_cycle_supported: true,
    source_trace_required: true,
    entity_linking_required: true
  },
  normalized_fields: [
    "training_program",
    "training_provider",
    "provider_type",
    "training_category",
    "certification_relevance",
    "mandate_status",
    "training_cycle",
    "schedule_date",
    "delivery_method",
    "target_audience",
    "related_agency",
    "state",
    "region",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_training_program",
    "missing_provider",
    "missing_source_trace",
    "unsupported_training_category",
    "unlinked_training_entity"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L04 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
