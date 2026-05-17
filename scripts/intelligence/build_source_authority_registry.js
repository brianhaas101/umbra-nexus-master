const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/authority/source_authority_registry.json";

const registry = {
  version: "nexus_source_authority_registry_v1",
  generated_at: new Date().toISOString(),
  total_layers: 12,
  authority_classes: [
    "FEDERAL","STATE","LOCAL","COMMERCIAL","ACADEMIC",
    "OSINT","PROCUREMENT","GIS","FINANCIAL","OPERATIONAL"
  ],
  global_rules: {
    deterministic_normalization_required: true,
    evidence_traceability_required: true,
    guessed_data_disallowed: true,
    runtime_registration_required: true,
    source_conflict_resolution_required: true,
    freshness_tracking_required: true,
    geospatial_validation_required: true,
    audit_logging_required: true
  },
  layers: [
    { layer_id:"L01_FEDERAL_INTELLIGENCE", authority_priority:1, default_weight:1.0, minimum_sources_required:15 },
    { layer_id:"L02_STATE_INTELLIGENCE", authority_priority:2, default_weight:0.9, minimum_sources_required:15 },
    { layer_id:"L03_LOCAL_AGENCY_INTELLIGENCE", authority_priority:3, default_weight:0.85, minimum_sources_required:15 },
    { layer_id:"L04_TRAINING_INFRASTRUCTURE", authority_priority:4, default_weight:0.8, minimum_sources_required:15 },
    { layer_id:"L05_BUDGET_AND_FUNDING", authority_priority:5, default_weight:0.8, minimum_sources_required:15 },
    { layer_id:"L06_BEHAVIORAL_ACTIVITY", authority_priority:6, default_weight:0.75, minimum_sources_required:15 },
    { layer_id:"L07_GEOGRAPHIC_TERRITORY", authority_priority:7, default_weight:0.85, minimum_sources_required:15 },
    { layer_id:"L08_COMMAND_STRUCTURE", authority_priority:8, default_weight:0.8, minimum_sources_required:15 },
    { layer_id:"L09_PROCUREMENT_INTELLIGENCE", authority_priority:9, default_weight:0.8, minimum_sources_required:15 },
    { layer_id:"L10_COMMUNICATION_INTELLIGENCE", authority_priority:10, default_weight:0.75, minimum_sources_required:15 },
    { layer_id:"L11_INCIDENT_AND_RISK", authority_priority:11, default_weight:0.85, minimum_sources_required:15 },
    { layer_id:"L12_ENGAGEMENT_RESPONSE", authority_priority:12, default_weight:0.7, minimum_sources_required:15 }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[SOURCE AUTHORITY REGISTRY] COMPLETE", registry.layers.length);
