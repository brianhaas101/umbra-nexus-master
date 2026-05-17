const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT = "public/data/clients/black_dragon/master_build_run.json";

const commands = [
  "node scripts/clients/black_dragon/build_national_verified_outreach_shortlist.js",
  "node scripts/intelligence/normalize_black_dragon_verified_targets.js",
  "node scripts/clients/black_dragon/build_dossier_targets.js",
  "node scripts/clients/black_dragon/build_black_dragon_client_sync.js",
  "node scripts/clients/black_dragon/build_runtime_authority_map.js",
  "node scripts/clients/black_dragon/build_scoring_export_bridge.js",
  "node scripts/clients/black_dragon/build_dossier_export_bridge.js",
  "node scripts/clients/black_dragon/build_execution_state_bridge.js",
  "node scripts/clients/black_dragon/build_live_ingestion_manifest.js",
  "node scripts/clients/black_dragon/build_source_freshness_audit.js",
  "node scripts/clients/black_dragon/build_intelligence_refresh_ledger.js",
  "node scripts/clients/black_dragon/build_runtime_integrity_check.js",
  "node scripts/clients/black_dragon/build_geocode_cache.js",
  "node scripts/clients/black_dragon/build_city_normalization_registry.js",
  "node scripts/clients/black_dragon/build_geographic_intelligence_layer.js",
  "node scripts/clients/black_dragon/build_territory_clusters.js",
  "node scripts/clients/black_dragon/build_real_globe_sync_export.js",
  "node scripts/clients/black_dragon/build_runtime_loader_manifest.js",
  "node scripts/clients/black_dragon/build_globe_data_adapter.js",
  "node scripts/clients/black_dragon/build_client_dossier_index.js",
  "node scripts/clients/black_dragon/build_operational_ui_state.js",
  "node scripts/clients/black_dragon/build_runtime_integration_batch_audit.js"
];

const results = [];

for (const command of commands) {
  try {
    const output = execSync(command, { encoding: "utf8" });
    results.push({ command, status: "PASS", output });
    console.log("[MASTER] PASS", command);
  } catch (err) {
    results.push({
      command,
      status: "FAIL",
      error: err.message,
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || ""
    });
    console.error("[MASTER] FAIL", command);
    break;
  }
}

const report = {
  version: "black_dragon_master_build_run_v1",
  generated_at: new Date().toISOString(),
  total_commands: commands.length,
  passed: results.filter(r => r.status === "PASS").length,
  failed: results.filter(r => r.status === "FAIL").length,
  status: results.some(r => r.status === "FAIL") ? "REVIEW_REQUIRED" : "PASS",
  results
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

console.log("[MASTER] COMPLETE", report.status, report.passed, report.failed);
