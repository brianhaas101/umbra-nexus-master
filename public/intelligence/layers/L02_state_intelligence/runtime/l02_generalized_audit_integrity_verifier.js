import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const logs = path.join(root, "logs", "intelligence_layers");

const monitored = [
  {
    log: "L02_scaffold_verifier.log",
    pass: "L02_SCAFFOLD_VERIFIER_PASS"
  },
  {
    log: "L02_probe_and_score_executor.log",
    pass: "L02_PROBE_AND_SCORE_EXECUTOR_PASS"
  },
  {
    log: "L02_heuristic_resolver.log",
    pass: "L02_HEURISTIC_RESOLVER_PASS"
  },
  {
    log: "L02_wave_al_ak_az_builder.log",
    pass: "L02 AL-AK-AZ WAVE BUILDER VERIFIED"
  }
];

const failureMarkers = [
  "STOP:",
  "SyntaxError",
  "MODULE_NOT_FOUND",
  "Cannot use import statement outside a module",
  "Error:",
  "failed",
  "Exception setting",
  "FullyQualifiedErrorId"
];

function read(file) {
  return fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")
    : "";
}

const failures = [];

for (const item of monitored) {
  const file = path.join(logs, item.log);
  const text = read(file);

  if (!text) {
    failures.push({ log: item.log, reason: "missing_log" });
    continue;
  }

  const hasPass = text.includes(item.pass);
  const hitMarkers = failureMarkers.filter(marker => text.includes(marker));

  if (!hasPass) {
    failures.push({ log: item.log, reason: "missing_pass_token" });
  }

  if (hasPass && hitMarkers.length > 0) {
    failures.push({
      log: item.log,
      reason: "pass_log_contains_failure_marker",
      markers: hitMarkers
    });
  }
}

const report = {
  layer_id: "L02",
  generalized_audit_integrity_pass: failures.length === 0,
  monitored_logs: monitored.map(m => m.log),
  failures,
  client_paths_touched: false
};

fs.writeFileSync(
  path.join(logs, "L02_generalized_audit_integrity_report.json"),
  JSON.stringify(report, null, 2)
);

if (failures.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log("L02_GENERALIZED_AUDIT_INTEGRITY_PASS");
