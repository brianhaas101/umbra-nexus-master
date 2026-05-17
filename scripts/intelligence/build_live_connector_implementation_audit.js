const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/live_connector_implementation_audit.json";

const required = [
  "public/data/intelligence/outputs/L03_LOCAL_AGENCY_INTELLIGENCE.normalized.json",
  "public/data/intelligence/outputs/L10_COMMUNICATION_INTELLIGENCE.normalized.json",
  "public/data/intelligence/outputs/L12_ENGAGEMENT_RESPONSE.normalized.json",
  "public/data/intelligence/outputs/unified_entity_fusion_output.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const fusion = fs.existsSync(required[3])
  ? JSON.parse(fs.readFileSync(required[3], "utf8"))
  : { fusion_summary: null };

const audit = {
  version: "nexus_live_connector_implementation_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  missing_files: missing.length,
  missing,
  fusion_summary: fusion.fusion_summary,
  live_layers_active: ["L03_LOCAL_AGENCY_INTELLIGENCE", "L10_COMMUNICATION_INTELLIGENCE", "L12_ENGAGEMENT_RESPONSE"]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[LIVE CONNECTOR IMPLEMENTATION AUDIT]", audit.status, audit.missing_files);
