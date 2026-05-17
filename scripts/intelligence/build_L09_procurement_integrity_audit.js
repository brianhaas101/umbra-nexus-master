const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/L09_procurement_integrity_audit.json";

const required = [
  "public/data/intelligence/sources/L09_PROCUREMENT_INTELLIGENCE.sources.json",
  "public/data/intelligence/evidence/L09_procurement_normalization.registry.json",
  "public/data/intelligence/scoring/L09_procurement_scoring.registry.json",
  "public/data/intelligence/runtime/L09_procurement_adapter_manifest.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_L09_procurement_integrity_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[L09 INTEGRITY AUDIT]", audit.status, audit.missing_files);
