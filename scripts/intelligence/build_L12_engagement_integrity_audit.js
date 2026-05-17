const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/L12_engagement_integrity_audit.json";

const required = [
  "public/data/intelligence/sources/L12_ENGAGEMENT_RESPONSE.sources.json",
  "public/data/intelligence/evidence/L12_engagement_normalization.registry.json",
  "public/data/intelligence/scoring/L12_engagement_scoring.registry.json",
  "public/data/intelligence/runtime/L12_engagement_adapter_manifest.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_L12_engagement_integrity_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[L12 INTEGRITY AUDIT]", audit.status, audit.missing_files);
