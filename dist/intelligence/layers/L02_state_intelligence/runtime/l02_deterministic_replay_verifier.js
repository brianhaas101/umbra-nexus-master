import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const freeze = path.join(l02, "freeze");

const ledgerPath = path.join(freeze, "L02_verification_ledger.json");
const rollbackPath = path.join(freeze, "L02_registry_rollback_snapshots.json");

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const ledger = readJson(ledgerPath, {
  ledger_id: "L02_append_only_verification_ledger",
  version: "1.0.0",
  append_only: true,
  entries: [],
  client_paths_touched: false
});

const rollback = readJson(rollbackPath, {
  rollback_manifest_id: "L02_registry_rollback_snapshots",
  version: "1.0.0",
  snapshots: [],
  client_paths_touched: false
});

assert(ledger.append_only === true, "Ledger must be append-only.");
assert(Array.isArray(ledger.entries), "Ledger entries must be an array.");
assert(ledger.client_paths_touched === false, "Ledger client path mutation detected.");

for (const entry of ledger.entries) {
  assert(entry.client_paths_touched === false, "Ledger entry client path mutation detected.");
  assert(entry.replay_envelope_hash, "Ledger entry missing replay envelope hash.");

  const clone = { ...entry };
  delete clone.verified_at;
  delete clone.replay_envelope_hash;
  delete clone.client_paths_touched;

  const recomputed = sha256(clone);
  assert(
    recomputed === entry.replay_envelope_hash,
    `Replay hash mismatch for ledger entry ${entry.target_id || "unknown"}`
  );
}

assert(Array.isArray(rollback.snapshots), "Rollback snapshots must be an array.");
assert(rollback.client_paths_touched === false, "Rollback client path mutation detected.");

for (const snapshot of rollback.snapshots) {
  assert(snapshot.client_paths_touched === false, "Snapshot client path mutation detected.");
  assert(snapshot.aggregate_hash, "Snapshot missing aggregate hash.");
  assert(snapshot.aggregate, "Snapshot missing aggregate body.");

  const recomputed = sha256(snapshot.aggregate);
  assert(recomputed === snapshot.aggregate_hash, "Rollback snapshot hash mismatch.");
}

const report = {
  verifier_id: "L02_deterministic_replay_verifier",
  ledger_entries: ledger.entries.length,
  rollback_snapshots: rollback.snapshots.length,
  deterministic_replay_pass: true,
  client_paths_touched: false
};

fs.writeFileSync(
  path.join(freeze, "L02_deterministic_replay_report.json"),
  JSON.stringify(report, null, 2)
);

console.log("L02_DETERMINISTIC_REPLAY_VERIFIER_PASS");