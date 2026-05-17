const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/authority/conflict_resolution.registry.json";

const registry = {
  version: "nexus_conflict_resolution_registry_v1",
  generated_at: new Date().toISOString(),
  rules: {
    authority_priority_resolution_enabled: true,
    newest_valid_evidence_priority_enabled: true,
    manual_override_priority_enabled: true,
    audit_logging_required: true
  },
  resolution_order: [
    "MANUAL_VERIFIED",
    "FEDERAL_SOURCE",
    "STATE_SOURCE",
    "LOCAL_SOURCE",
    "COMMERCIAL_SOURCE",
    "OSINT_SOURCE"
  ],
  conflict_types: [
    "ENTITY_NAME_MISMATCH",
    "ADDRESS_MISMATCH",
    "PHONE_MISMATCH",
    "ROLE_MISMATCH",
    "GEOSPATIAL_MISMATCH",
    "PROCUREMENT_CONFLICT",
    "COMMAND_STRUCTURE_CONFLICT"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[CONFLICT RESOLUTION REGISTRY] COMPLETE");
