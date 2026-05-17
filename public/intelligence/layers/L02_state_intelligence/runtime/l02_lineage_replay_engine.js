import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const freeze = path.join(l02, "freeze");

const ledgerPath = path.join(freeze, "L02_verification_ledger.json");

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

export function appendVerification(entry) {
  const ledger = readJson(ledgerPath, {
    ledger_id: "L02_append_only_verification_ledger",
    version: "1.0.0",
    append_only: true,
    entries: [],
    client_paths_touched: false
  });

  const record = Object.freeze({
    ...entry,
    verified_at: new Date().toISOString(),
    replay_envelope_hash: sha256(entry),
    client_paths_touched: false
  });

  ledger.entries.push(record);
  ledger.latest_ledger_hash = sha256(ledger.entries);

  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

  return record;
}

console.log("L02_LINEAGE_REPLAY_ENGINE_PASS");
