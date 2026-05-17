const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const OUT = "public/data/intelligence/runtime/intelligence_master_runner.json";

const commands = [
  "node scripts/intelligence/build_master_layer_registry.js",
  "node scripts/intelligence/build_unified_adapter_orchestration.js",
  "node scripts/intelligence/build_live_ingestion_execution_queue.js",
  "node scripts/intelligence/build_cross_layer_dependency_graph.js",
  "node scripts/intelligence/build_full_system_intelligence_audit.js"
];

const results = [];

for (const command of commands) {
  try {
    const output = execSync(command, { encoding: "utf8" });
    results.push({ command, status: "PASS", output });
    console.log("[MASTER RUNNER] PASS", command);
  } catch (err) {
    results.push({
      command,
      status: "FAIL",
      error: err.message,
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || ""
    });
    console.error("[MASTER RUNNER] FAIL", command);
    break;
  }
}

const report = {
  version: "nexus_intelligence_master_runner_v1",
  generated_at: new Date().toISOString(),
  total_commands: commands.length,
  passed: results.filter(r => r.status === "PASS").length,
  failed: results.filter(r => r.status === "FAIL").length,
  status: results.some(r => r.status === "FAIL") ? "REVIEW_REQUIRED" : "PASS",
  results
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));

console.log("[INTELLIGENCE MASTER RUNNER]", report.status, report.passed, report.failed);
