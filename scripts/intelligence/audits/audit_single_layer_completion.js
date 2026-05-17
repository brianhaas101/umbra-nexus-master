const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const LAYER_ID = process.argv[2] || "L01";

const REQUIRED_SOURCE_COUNT = 15;

const requiredSourceFields = [
  "source_id",
  "layer_id",
  "name",
  "authority_score",
  "acquisition_type",
  "cadence",
  "operational_status",
  "lineage_tracking_enabled",
  "evidence_retention_policy"
];

const requiredEvidenceFields = [
  "evidence_id",
  "entity_id",
  "layer_id",
  "source_id",
  "captured_at",
  "confidence",
  "lineage"
];

const requiredSignalFields = [
  "signal_id",
  "entity_id",
  "layer_id",
  "source_id",
  "signal_type",
  "strength",
  "confidence"
];

const requiredScoreFields = [
  "component_id",
  "entity_id",
  "layer_id",
  "source_id",
  "score_delta",
  "confidence"
];

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJson(file) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) return null;
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const item of fs.readdirSync(abs)) {
    const full = path.join(abs, item);
    const rel = path.relative(ROOT, full).replaceAll("\\", "/");
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, file))).digest("hex");
}

function findLayerJsonFiles() {
  return walk("public/data/intelligence")
    .filter(f => f.endsWith(".json"))
    .filter(f => f.toUpperCase().includes(LAYER_ID));
}

function extractArrays(obj) {
  const arrays = [];
  function visit(x) {
    if (Array.isArray(x)) arrays.push(x);
    else if (x && typeof x === "object") Object.values(x).forEach(visit);
  }
  visit(obj);
  return arrays;
}

function collectObjectsByLayer() {
  const files = walk("public/data/intelligence").filter(f => f.endsWith(".json"));
  const objects = [];

  for (const file of files) {
    let json;
    try { json = readJson(file); } catch { continue; }

    const arrays = extractArrays(json);
    for (const arr of arrays) {
      for (const item of arr) {
        if (item && typeof item === "object" && item.layer_id === LAYER_ID) {
          objects.push({ file, item });
        }
      }
    }

    if (json && typeof json === "object" && json.layer_id === LAYER_ID) {
      objects.push({ file, item: json });
    }
  }

  return objects;
}

function missingFields(obj, fields) {
  return fields.filter(f => obj[f] === undefined || obj[f] === null || obj[f] === "");
}

function classifyObjects(objects) {
  const sources = [];
  const evidence = [];
  const signals = [];
  const scores = [];

  for (const wrapped of objects) {
    const o = wrapped.item;

    if (o.source_id && o.name && o.authority_score !== undefined) sources.push(wrapped);
    if (o.evidence_id) evidence.push(wrapped);
    if (o.signal_id) signals.push(wrapped);
    if (o.component_id || o.score_delta !== undefined) scores.push(wrapped);
  }

  return { sources, evidence, signals, scores };
}

function findConnectors(sourceIds) {
  const scriptFiles = walk("scripts")
  .filter(f => /\.(js|mjs|cjs)$/.test(f));
  const runtimeFiles = walk("public/data/intelligence/runtime")
  .filter(f => f.endsWith(".json"));

const files = [...scriptFiles, ...runtimeFiles];
  const results = {};

  for (const sid of sourceIds) {
    results[sid] = files.filter(file => {
  try {
    const txt = fs.readFileSync(path.join(ROOT, file), "utf8");
    return (
      txt.includes(sid) ||
      txt.toLowerCase().includes(sid.toLowerCase())
    );
  } catch {
    return false;
  }
});
  }

  return results;
}

const allObjects = collectObjectsByLayer();
const classified = classifyObjects(allObjects);

const sourceIds = [...new Set(classified.sources.map(x => x.item.source_id))];
const connectorMap = findConnectors(sourceIds);

const invalidSources = classified.sources.map(x => ({
  file: x.file,
  source_id: x.item.source_id,
  missing: missingFields(x.item, requiredSourceFields)
})).filter(x => x.missing.length);

const invalidEvidence = classified.evidence.map(x => ({
  file: x.file,
  evidence_id: x.item.evidence_id,
  source_id: x.item.source_id,
  missing: missingFields(x.item, requiredEvidenceFields)
})).filter(x => x.missing.length);

const invalidSignals = classified.signals.map(x => ({
  file: x.file,
  signal_id: x.item.signal_id,
  source_id: x.item.source_id,
  missing: missingFields(x.item, requiredSignalFields)
})).filter(x => x.missing.length);

const invalidScores = classified.scores.map(x => ({
  file: x.file,
  component_id: x.item.component_id || null,
  source_id: x.item.source_id,
  missing: missingFields(x.item, requiredScoreFields)
})).filter(x => x.missing.length);

const connectorCoverage = sourceIds.map(source_id => ({
  source_id,
  connector_files: connectorMap[source_id] || [],
  connector_found: (connectorMap[source_id] || []).length > 0
}));

const missingConnectorCoverage = connectorCoverage.filter(x => !x.connector_found);

const layerFiles = findLayerJsonFiles();
const hashes = layerFiles.map(file => ({ file, sha256: hashFile(file) }));

const gates = {
  registry_15_sources: sourceIds.length >= REQUIRED_SOURCE_COUNT,
  registry_fields_valid: invalidSources.length === 0,
  connector_coverage_valid: missingConnectorCoverage.length === 0,
  evidence_lineage_valid: classified.evidence.length > 0 && invalidEvidence.length === 0,
  signals_valid: classified.signals.length > 0 && invalidSignals.length === 0,
  scoring_valid: classified.scores.length > 0 && invalidScores.length === 0,
  layer_files_present: layerFiles.length > 0
};

const pass = Object.values(gates).every(Boolean);

const report = {
  layer_id: LAYER_ID,
  generated_at: new Date().toISOString(),
  completion_status: pass ? "COMPLETE" : "INCOMPLETE",
  gates,
  counts: {
    sources: sourceIds.length,
    evidence: classified.evidence.length,
    signals: classified.signals.length,
    score_components: classified.scores.length,
    layer_files: layerFiles.length
  },
  source_ids: sourceIds.sort(),
  connector_coverage: connectorCoverage,
  failures: {
    invalid_sources: invalidSources,
    missing_connector_coverage: missingConnectorCoverage,
    invalid_evidence: invalidEvidence,
    invalid_signals: invalidSignals,
    invalid_score_components: invalidScores
  },
  deterministic_hashes: hashes
};

const outDir = path.join(ROOT, "logs/layer_completion");
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, `${LAYER_ID.toLowerCase()}_completion_audit.json`);
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

console.log(JSON.stringify({
  layer_id: LAYER_ID,
  completion_status: report.completion_status,
  gates,
  counts: report.counts,
  report: outFile
}, null, 2));

if (!pass) process.exit(1);
