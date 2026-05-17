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

const SOURCES = [
  "L01_SRC_006_FBI_PUBLIC_DATA",
  "L01_SRC_007_DEA_PUBLIC_RELEASES",
  "L01_SRC_008_FEMA_PREPAREDNESS_GRANTS",
  "L01_SRC_009_FEDERAL_REGISTER",
  "L01_SRC_010_BUREAU_OF_JUSTICE_STATISTICS"
];

const report = {
  version: "nexus_L01_live_sophistication_batch_002_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  sophistication_phase: "LIVE_CONNECTOR_BATCH_002",
  status: "PASS",
  failures: [],
  gates: {
    source_count_valid: SOURCES.length === 5,
    lineage_complete: true,
    replay_ready: true,
    hashes_present: true,
    evidence_present: true,
    signal_alignment_valid: true,
    score_alignment_valid: true,
    reference_bindings_present: true
  },
  counts: {
    total_sources: 0,
    reference_sources: 0,
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

for (const source_id of SOURCES) {
  const state = readJson(`public/data/intelligence/live_cache/L01/state/${source_id}.state.json`);
  const normalized = readJson(`public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`);

  const isReference = state.status.startsWith("REFERENCE_READY");

  if (!isReference) {
    report.gates.reference_bindings_present = false;
    fail(`${source_id}_REFERENCE_BINDING_MISSING`);
  }

  if (!state.lineage_complete) {
    report.gates.lineage_complete = false;
    fail(`${source_id}_LINEAGE_INCOMPLETE`);
  }

  if (!state.deterministic_replay_ready) {
    report.gates.replay_ready = false;
    fail(`${source_id}_REPLAY_NOT_READY`);
  }

  if (!state.raw_snapshot_hash || !state.normalized_snapshot_hash) {
    report.gates.hashes_present = false;
    fail(`${source_id}_HASH_MISSING`);
  }

  if (normalized.evidence.length < 1) {
    report.gates.evidence_present = false;
    fail(`${source_id}_NO_EVIDENCE`);
  }

  if (normalized.signals.length !== normalized.evidence.length) {
    report.gates.signal_alignment_valid = false;
    fail(`${source_id}_SIGNAL_ALIGNMENT_INVALID`);
  }

  if (normalized.score_components.length !== normalized.evidence.length) {
    report.gates.score_alignment_valid = false;
    fail(`${source_id}_SCORE_ALIGNMENT_INVALID`);
  }

  report.counts.total_sources++;
  if (isReference) report.counts.reference_sources++;
  report.counts.total_evidence += normalized.evidence.length;
  report.counts.total_signals += normalized.signals.length;
  report.counts.total_score_components += normalized.score_components.length;

  report.source_report.push({
    source_id,
    state: state.status,
    evidence: normalized.evidence.length,
    signals: normalized.signals.length,
    score_components: normalized.score_components.length,
    reference_binding: isReference
  });
}

writeJson("logs/sophistication/L01_live_sophistication_batch_002_audit.json", report);

console.log(JSON.stringify(report, null, 2));
