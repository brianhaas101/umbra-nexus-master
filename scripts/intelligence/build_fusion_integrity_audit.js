const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/fusion_integrity_audit.json";

const required = [
  "public/data/intelligence/scoring/cross_layer_fusion.registry.json",
  "public/data/intelligence/scoring/confidence_scoring.registry.json",
  "public/data/intelligence/scoring/freshness_weighting.registry.json",
  "public/data/intelligence/runtime/temporal_signal.registry.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const audit = {
  version: "nexus_fusion_integrity_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));
console.log("[FUSION INTEGRITY AUDIT]", audit.status, audit.missing_files);
