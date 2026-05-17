const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, "")
  );
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const state = readJson("public/data/intelligence/live_cache/L01/state/L01_SRC_001_USA_SPENDING.state.json");
const raw = readJson("public/data/intelligence/live_cache/L01/raw/L01_SRC_001_USA_SPENDING.raw_snapshot.json");
const normalized = readJson("public/data/intelligence/live_cache/L01/normalized/L01_SRC_001_USA_SPENDING.normalized_snapshot.json");

const report = {
  version: "nexus_L01_usaspending_live_fetch_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  source_id: "L01_SRC_001_USA_SPENDING",
  status: "PASS",
  failures: [],
  gates: {
    state_success: state.status === "LIVE_FETCH_SUCCESS",
    raw_fetch_success: raw.status === "FETCH_SUCCESS",
    http_200: raw.response && raw.response.status === 200,
    normalized_success: normalized.status === "NORMALIZED_FROM_LIVE_FETCH",
    evidence_present: normalized.evidence.length > 0,
    signals_match_evidence: normalized.signals.length === normalized.evidence.length,
    scores_match_evidence: normalized.score_components.length === normalized.evidence.length,
    lineage_complete: state.lineage_complete === true,
    deterministic_replay_ready: state.deterministic_replay_ready === true,
    hashes_present: Boolean(state.raw_snapshot_hash && state.normalized_snapshot_hash)
  },
  counts: {
    evidence: normalized.evidence.length,
    signals: normalized.signals.length,
    score_components: normalized.score_components.length,
    live_record_count: state.live_record_count
  }
};

function fail(code) {
  report.status = "FAIL";
  report.failures.push(code);
}

for (const [gate, passed] of Object.entries(report.gates)) {
  if (!passed) fail(gate.toUpperCase() + "_FAILED");
}

writeJson("logs/sophistication/L01_usaspending_live_fetch_audit.json", report);

console.log(JSON.stringify(report, null, 2));
