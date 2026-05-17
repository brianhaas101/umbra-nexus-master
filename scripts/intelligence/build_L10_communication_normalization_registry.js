const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L10_communication_normalization.registry.json";

const registry = {
  version: "nexus_L10_communication_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L10_COMMUNICATION_INTELLIGENCE",
  normalization_rules: {
    contact_method_required: true,
    route_type_required: true,
    source_trace_required: true,
    validation_status_required: true,
    fallback_path_supported: true,
    no_guessed_contacts: true
  },
  normalized_fields: [
    "entity_id",
    "contact_name",
    "contact_title",
    "department",
    "phone",
    "email",
    "extension",
    "route_type",
    "primary_route",
    "fallback_route",
    "fallback_phone",
    "contact_priority",
    "validation_status",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_contact_method",
    "missing_source_trace",
    "guessed_email",
    "invalid_phone",
    "unverified_final_contact"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L10 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
