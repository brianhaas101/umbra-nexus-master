const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/signal_schema.registry.json";

const registry = {
  version: "nexus_signal_schema_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Every normalized signal must be layer-bound, evidence-backed, confidence-scored, and operationally typed.",
  required_fields: [
    "signal_id",
    "entity_id",
    "layer_id",
    "signal_type",
    "signal_value",
    "operational_relevance",
    "source_trace",
    "confidence_score",
    "freshness_score",
    "created_at"
  ],
  signal_classes: [
    "AUTHORITY_SIGNAL",
    "TRAINING_SIGNAL",
    "BUDGET_SIGNAL",
    "PROCUREMENT_SIGNAL",
    "GEOGRAPHIC_SIGNAL",
    "RISK_SIGNAL",
    "COMMUNICATION_SIGNAL",
    "ENGAGEMENT_SIGNAL",
    "BEHAVIORAL_SIGNAL"
  ],
  blocked_conditions: [
    "missing_layer_id",
    "missing_entity_id",
    "missing_source_trace",
    "unscored_signal",
    "unsupported_signal_class"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SIGNAL SCHEMA] COMPLETE", registry.required_fields.length);
