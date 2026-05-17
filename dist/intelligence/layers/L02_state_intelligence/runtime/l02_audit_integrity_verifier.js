import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const logs = path.join(root, "logs", "intelligence_layers");

const criticalPairs = [
  {
    log: "L02_scaffold_verifier.log",
    requiredToken: "L02_SCAFFOLD_VERIFIER_PASS",
    runtimeFailureIndicators: [
      "SyntaxError",
      "MODULE_NOT_FOUND",
      "Cannot use import statement outside a module",
      "STOP: L02 scaffold verifier failed."
    ]
  }
];

function read(file) {
  return fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")
    : "";
}

const failures = [];

for (const pair of criticalPairs) {
  const logText = read(path.join(logs, pair.log));

  const hasPass = logText.includes(pair.requiredToken);

  for (const indicator of pair.runtimeFailureIndicators) {
    if (logText.includes(indicator) && hasPass) {
      failures.push({
        log: pair.log,
        reason: "invalid_pass_after_runtime_failure",
        indicator
      });
    }
  }
}

const outPath = path.join(logs, "L02_audit_integrity_report.json");

const result = {
  layer_id: "L02",
  audit_integrity_pass: failures.length === 0,
  failures,
  repair_required: failures.length > 0,
  client_paths_touched: false
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

if (failures.length > 0) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log("L02_AUDIT_INTEGRITY_PASS");
