const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/validation_integrity_audit.json";

const required = [
  "public/data/intelligence/runtime/entity_validation_engine.registry.json",
  "public/data/intelligence/runtime/signal_validation_engine.registry.json",
  "public/data/intelligence/runtime/dossier_validation_engine.registry.json",
  "public/data/intelligence/runtime/scoring_validation_engine.registry.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_validation_integrity_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
console.log("[VALIDATION INTEGRITY AUDIT]", audit.status, audit.missing_files);
