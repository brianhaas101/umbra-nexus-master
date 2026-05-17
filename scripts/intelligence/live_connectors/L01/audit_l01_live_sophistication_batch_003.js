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

const SOURCES = [
  "L01_SRC_011_COPS_OFFICE_PROGRAMS",
  "L01_SRC_012_FEDERAL_ADVISORY_REFERENCES",
  "L01_SRC_013_FEDERAL_TRAINING_CENTERS",
  "L01_SRC_014_TREASURY_CRIME_DATA",
  "L01_SRC_015_CONGRESSIONAL_BUDGET_RELEASES"
];

const report = {
  version: "nexus_L01_live_sophistication_batch_003_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  sophistication_phase: "LIVE_CONNECTOR_BATCH_003",
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
    reference_bindings_present: true,
    manual_review_states_preserved: true
  },
  counts: {
    total_sources: 0,
    reference_sources: 0,
    manual_review_sources: 0,
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

  const state = readJson(
    `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`
  );

  const normalized = readJson(
    `public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`
  );

  const isReference =
    state.status.startsWith("REFERENCE_READY");

  const isManual =
    state.status === "MANUAL_REVIEW_REQUIRED";

  if (!isReference && !isManual) {
    report.gates.reference_bindings_present = false;
    fail(`${source_id}_INVALID_STATE`);
  }

  if (
    (source_id === "L01_SRC_012_FEDERAL_ADVISORY_REFERENCES" ||
     source_id === "L01_SRC_013_FEDERAL_TRAINING_CENTERS")
     && !isManual
  ) {
    report.gates.manual_review_states_preserved = false;
    fail(`${source_id}_MANUAL_REVIEW_STATE_REMOVED`);
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

  if (isReference) {
    report.counts.reference_sources++;
  }

  if (isManual) {
    report.counts.manual_review_sources++;
  }

  report.counts.total_evidence += normalized.evidence.length;
  report.counts.total_signals += normalized.signals.length;
  report.counts.total_score_components += normalized.score_components.length;

  report.source_report.push({
    source_id,
    state: state.status,
    evidence: normalized.evidence.length,
    signals: normalized.signals.length,
    score_components: normalized.score_components.length,
    reference_binding: isReference,
    manual_review: isManual
  });
}

writeJson(
  "logs/sophistication/L01_live_sophistication_batch_003_audit.json",
  report
);

console.log(JSON.stringify(report, null, 2));
