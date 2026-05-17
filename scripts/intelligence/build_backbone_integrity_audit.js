const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/backbone_integrity_audit.json";

const required = [
  "public/data/intelligence/authority/source_authority_registry.json",
  "public/data/intelligence/evidence/evidence_schema.registry.json",
  "public/data/intelligence/runtime/runtime_manifest.registry.json",
  "public/data/intelligence/scoring/scoring_orchestration.registry.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_backbone_integrity_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
console.log("[BACKBONE AUDIT]", audit.status, audit.missing_files);
