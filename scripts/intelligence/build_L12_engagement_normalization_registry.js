const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L12_engagement_normalization.registry.json";

const registry = {
  version: "nexus_L12_engagement_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L12_ENGAGEMENT_RESPONSE",
  normalization_rules: {
    engagement_event_required: true,
    entity_linking_required: true,
    timestamp_required: true,
    outcome_status_required: true,
    source_trace_required: true,
    follow_up_state_supported: true
  },
  normalized_fields: [
    "engagement_id",
    "entity_id",
    "client_key",
    "contact_name",
    "contact_role",
    "engagement_type",
    "engagement_channel",
    "engagement_timestamp",
    "outcome_status",
    "response_quality",
    "follow_up_required",
    "next_action",
    "conversion_stage",
    "relationship_strength",
    "objection_type",
    "source_category",
    "confidence_score",
    "freshness_score"
  ],
  blocked_conditions: [
    "missing_engagement_event",
    "missing_entity_id",
    "missing_timestamp",
    "missing_outcome_status",
    "unlinked_client_account"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L12 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
