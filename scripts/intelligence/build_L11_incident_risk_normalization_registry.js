const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L11_incident_risk_normalization.registry.json";

const registry = {
  version: "nexus_L11_incident_risk_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L11_INCIDENT_AND_RISK",
  normalization_rules: {
    incident_time_required: true,
    geospatial_reference_required: true,
    severity_classification_required: true,
    source_trace_required: true,
    entity_linking_required: true,
    escalation_tracking_supported: true
  },
  normalized_fields: [
    "incident_id",
    "incident_type",
    "incident_date",
    "incident_location",
    "severity_level",
    "risk_category",
    "affected_entity",
    "regional_impact",
    "operational_disruption",
    "response_required",
    "escalation_status",
    "confidence_score",
    "freshness_score",
    "source_category"
  ],
  blocked_conditions: [
    "missing_incident_date",
    "missing_geospatial_reference",
    "missing_source_trace",
    "unresolved_entity_link",
    "unsupported_risk_category"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L11 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
