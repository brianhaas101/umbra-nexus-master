const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const sources = [
  "L01_SRC_001_USA_SPENDING",
  "L01_SRC_002_SAM_GOV"
];

const report = {
  version: "nexus_L01_live_first_two_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  status: "PASS",
  failures: [],
  sources: []
};

function fail(code) {
  report.status = "FAIL";
  report.failures.push(code);
}

for (const source_id of sources) {
  const state = readJson(`public/data/intelligence/live_cache/L01/state/${source_id}.state.json`);
  const raw = readJson(`public/data/intelligence/live_cache/L01/raw/${source_id}.raw_snapshot.json`);
  const normalized = readJson(`public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`);

  const item = {
    source_id,
    state: state.status,
    raw_status: raw.status,
    normalized_status: normalized.status,
    evidence: normalized.evidence.length,
    signals: normalized.signals.length,
    score_components: normalized.score_components.length,
    lineage_complete: state.lineage_complete,
    replay_ready: state.deterministic_replay_ready,
    hashes_present: Boolean(state.raw_snapshot_hash && state.normalized_snapshot_hash)
  };

  if (!item.lineage_complete) fail(`${source_id}_LINEAGE_INCOMPLETE`);
  if (!item.replay_ready) fail(`${source_id}_REPLAY_NOT_READY`);
  if (!item.hashes_present) fail(`${source_id}_HASHES_MISSING`);
  if (item.evidence < 1) fail(`${source_id}_EVIDENCE_EMPTY`);
  if (item.signals !== item.evidence) fail(`${source_id}_SIGNAL_COUNT_MISMATCH`);
  if (item.score_components !== item.evidence) fail(`${source_id}_SCORE_COUNT_MISMATCH`);

  report.sources.push(item);
}

writeJson("logs/sophistication/L01_live_first_two_audit.json", report);

console.log(JSON.stringify(report, null, 2));
