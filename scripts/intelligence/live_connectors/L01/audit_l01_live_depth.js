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

const registry = readJson("public/data/intelligence/live_connectors/L01_federal_live_connector.registry.json");

const report = {
  version: "nexus_L01_live_depth_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  status: "PASS",
  failures: [],
  counts: {
    total_sources: registry.connectors.length,
    live_fetch_success: 0,
    reference_ready: 0,
    manual_review_required: 0,
    failed: 0,
    total_evidence: 0,
    total_signals: 0,
    total_score_components: 0
  },
  source_report: []
};

function fail(code) {
  report.status = "FAIL";
  report.failures.push(code);
}

for (const connector of registry.connectors) {
  const source_id = connector.source_id;
  const statePath = `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`;
  const normPath = `public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`;

  if (!fs.existsSync(path.join(ROOT, statePath))) {
    fail(`${source_id}_STATE_MISSING`);
    continue;
  }

  if (!fs.existsSync(path.join(ROOT, normPath))) {
    fail(`${source_id}_NORMALIZED_MISSING`);
    continue;
  }

  const state = readJson(statePath);
  const norm = readJson(normPath);

  const evidence = Array.isArray(norm.evidence) ? norm.evidence.length : 0;
  const signals = Array.isArray(norm.signals) ? norm.signals.length : 0;
  const scores = Array.isArray(norm.score_components) ? norm.score_components.length : 0;

  if (state.status === "LIVE_FETCH_SUCCESS") report.counts.live_fetch_success++;
  else if (state.status && state.status.startsWith("REFERENCE_READY")) report.counts.reference_ready++;
  else if (state.status === "MANUAL_REVIEW_REQUIRED") report.counts.manual_review_required++;
  else report.counts.failed++;

  if (!state.lineage_complete) fail(`${source_id}_LINEAGE_INCOMPLETE`);
  if (!state.deterministic_replay_ready) fail(`${source_id}_REPLAY_NOT_READY`);
  if (!state.raw_snapshot_hash || !state.normalized_snapshot_hash) fail(`${source_id}_HASH_MISSING`);
  if (evidence < 1) fail(`${source_id}_NO_EVIDENCE`);
  if (signals !== evidence) fail(`${source_id}_SIGNAL_MISMATCH`);
  if (scores !== evidence) fail(`${source_id}_SCORE_MISMATCH`);

  report.counts.total_evidence += evidence;
  report.counts.total_signals += signals;
  report.counts.total_score_components += scores;

  report.source_report.push({
    source_id,
    source_name: connector.source_name,
    state: state.status,
    evidence,
    signals,
    score_components: scores,
    binding_required: state.binding_required || null,
    upgraded_from_reference: state.upgraded_from_reference === true
  });
}

writeJson("logs/sophistication/L01_live_depth_audit.json", report);

console.log(JSON.stringify(report, null, 2));
