import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");

const contract = JSON.parse(
  fs.readFileSync(
    path.join(l02, "schemas", "runtime_execution_gate.json"),
    "utf8"
  ).replace(/^\uFEFF/, "")
);

export function executeGuardedRuntime(scriptPath, expectedToken) {
  const run = spawnSync("node", [scriptPath], {
    encoding: "utf8"
  });

  const stdout = String(run.stdout || "");
  const stderr = String(run.stderr || "");
  const combined = `${stdout}\n${stderr}`;

  const failures = contract.failure_markers.filter(marker =>
    combined.includes(marker)
  );

  const passed =
    run.status === 0 &&
    stdout.includes(expectedToken) &&
    stderr.trim() === "" &&
    failures.length === 0;

  return Object.freeze({
    passed,
    exit_code: run.status,
    stdout,
    stderr,
    failures,
    expected_token: expectedToken
  });
}

console.log("L02_RUNTIME_EXECUTION_GATE_PASS");
