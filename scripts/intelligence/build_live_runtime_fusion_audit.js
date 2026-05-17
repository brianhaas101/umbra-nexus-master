const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/audit/live_runtime_fusion_audit.json";

const required = [
  "public/data/intelligence/runtime/live_connector_implementation.registry.json",
  "public/data/intelligence/runtime/connector_health_monitor.json",
  "public/data/intelligence/runtime/source_refresh_execution_engine.json",
  "public/data/intelligence/outputs/unified_entity_fusion_output.json"
];

const missing = required.filter(f => !fs.existsSync(f));

const fusion = fs.existsSync(required[3])
  ? JSON.parse(fs.readFileSync(required[3], "utf8"))
  : null;

const audit = {
  version: "nexus_live_runtime_fusion_audit_v1",
  generated_at: new Date().toISOString(),
  status: missing.length === 0 ? "PASS" : "REVIEW_REQUIRED",
  required_files: required.length,
  missing_files: missing.length,
  missing,
  fusion_summary: fusion?.fusion_summary || null,
  live_connector_note: "PASS means live-engine structure exists. It does not mean external connectors are pulling live source data yet."
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(audit, null, 2));

console.log("[LIVE RUNTIME FUSION AUDIT]", audit.status, audit.missing_files);
