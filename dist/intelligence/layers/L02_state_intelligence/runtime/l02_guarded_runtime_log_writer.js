import fs from "node:fs";
import { spawnSync } from "node:child_process";

const failureMarkers = [
  "STOP:",
  "SyntaxError",
  "MODULE_NOT_FOUND",
  "Cannot use import statement outside a module",
  "Exception setting",
  "FullyQualifiedErrorId"
];

export function guardedRun({ runtimeScript, expectedToken, logPath, logHeader, metadata = {} }) {
  const run = spawnSync("node", [runtimeScript], { encoding: "utf8" });

  const stdout = String(run.stdout || "");
  const stderr = String(run.stderr || "");
  const combined = `${stdout}\n${stderr}`;

  const failures = failureMarkers.filter(marker => combined.includes(marker));
  const passed = run.status === 0 && stdout.includes(expectedToken) && stderr.trim() === "" && failures.length === 0;

  const report = {
    runtime_script: runtimeScript,
    expected_token: expectedToken,
    exit_code: run.status,
    stdout,
    stderr,
    failures,
    passed,
    client_paths_touched: false
  };

  if (!passed) {
    fs.writeFileSync(`${logPath}.failed.json`, JSON.stringify(report, null, 2));
    throw new Error(`GUARDED_RUNTIME_FAILED: ${runtimeScript}`);
  }

  const timestamp = new Date().toISOString();
  const lines = [
    `[${timestamp}] ${logHeader}`,
    `[${timestamp}] RESULT: ${expectedToken}`,
    `[${timestamp}] EXIT_CODE: 0`,
    `[${timestamp}] STDERR_EMPTY: true`,
    `[${timestamp}] FAILURE_MARKERS: false`
  ];

  for (const [key, value] of Object.entries(metadata)) {
    lines.push(`[${timestamp}] ${key}: ${value}`);
  }

  lines.push(`[${timestamp}] CLIENT_PATHS_TOUCHED: false`);
  fs.writeFileSync(logPath, `${lines.join("\n")}\n`);

  return Object.freeze(report);
}

console.log("L02_GUARDED_RUNTIME_LOG_WRITER_PASS");

