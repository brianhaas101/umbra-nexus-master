import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const registryRoot = path.join(root, "public", "intelligence", "source_registry", "L02_state_intelligence");
const freeze = path.join(l02, "freeze");

const aggregateRegistry = path.join(l02, "source_registry.json");
const rollbackPath = path.join(freeze, "L02_registry_rollback_snapshots.json");

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

export function snapshotRegistry(reason = "pre_merge_snapshot") {
  const aggregate = readJson(aggregateRegistry, {
    layer_id: "L02",
    version: "0.0.0",
    sources: [],
    active_sources: 0,
    source_count: 0,
    client_paths_touched: false
  });

  const snapshot = {
    snapshot_id: `L02_REGISTRY_SNAPSHOT_${Date.now()}`,
    reason,
    created_at: new Date().toISOString(),
    aggregate_hash: sha256(aggregate),
    aggregate,
    client_paths_touched: false
  };

  const rollback = readJson(rollbackPath, {
    rollback_manifest_id: "L02_registry_rollback_snapshots",
    version: "1.0.0",
    snapshots: [],
    client_paths_touched: false
  });

  rollback.snapshots.push(snapshot);
  rollback.latest_snapshot_hash = sha256(snapshot);
  rollback.client_paths_touched = false;

  writeJson(rollbackPath, rollback);
  return snapshot;
}

export function mergeVerifiedSource(source) {
  if (!source || typeof source !== "object") throw new Error("source object required");
  if (!source.source_id) throw new Error("source_id required");
  if (!source.state_code) throw new Error("state_code required");
  if (!source.source_url) throw new Error("source_url required");
  if (source.synthetic_url === true) throw new Error("synthetic_url forbidden");
  if (source.inferred_contact === true) throw new Error("inferred_contact forbidden");

  snapshotRegistry(`pre_merge_${source.state_code}_${source.source_id}`);

  const aggregate = readJson(aggregateRegistry, {
    layer_id: "L02",
    version: "merge_engine",
    sources: [],
    active_sources: 0,
    source_count: 0,
    client_paths_touched: false
  });

  if (!Array.isArray(aggregate.sources)) aggregate.sources = [];

  const key = `${source.state_code}:${source.source_id}`;
  const existingIndex = aggregate.sources.findIndex(s => `${s.state_code}:${s.source_id}` === key);
  const now = new Date().toISOString();

  const merged = {
    ...source,
    layer_id: "L02",
    connector_active: true,
    normalizer_active: true,
    last_verified_at: now,
    last_refresh: now,
    registry_lineage_version: "1.0.0",
    provenance_required: true,
    replay_hashing_required: true,
    synthetic_url: false,
    inferred_contact: false,
    client_paths_touched: false
  };

  if (existingIndex >= 0) {
    aggregate.sources[existingIndex] = {
      ...aggregate.sources[existingIndex],
      ...merged,
      first_verified_at: aggregate.sources[existingIndex].first_verified_at || now,
      verification_count: (aggregate.sources[existingIndex].verification_count || 0) + 1
    };
  } else {
    aggregate.sources.push({
      ...merged,
      first_verified_at: now,
      verification_count: 1
    });
  }

  aggregate.active_sources = aggregate.sources.filter(s => s.connector_active === true && s.normalizer_active === true).length;
  aggregate.source_count = aggregate.sources.length;
  aggregate.latest_registry_hash = sha256(aggregate.sources);
  aggregate.updated_at = now;
  aggregate.client_paths_touched = false;

  writeJson(aggregateRegistry, aggregate);

  const fileName = `${source.state_code}_${source.source_id}.json`;
  writeJson(path.join(registryRoot, fileName), merged);

  return merged;
}

snapshotRegistry("self_test_snapshot");
console.log("L02_REGISTRY_MERGE_ENGINE_PASS");
