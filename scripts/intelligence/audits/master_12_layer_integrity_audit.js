const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

const LAYERS = [
  "L01",
  "L02",
  "L03",
  "L04",
  "L05",
  "L06",
  "L07",
  "L08",
  "L09",
  "L10",
  "L11",
  "L12"
];

function readJson(abs) {
  return JSON.parse(
    fs.readFileSync(abs, "utf8").replace(/^\uFEFF/, "")
  );
}

function sha256(abs) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(abs))
    .digest("hex");
}

const report = {
  generated_at: new Date().toISOString(),
  audit: "MASTER_12_LAYER_INTEGRITY_AUDIT",
  status: "PASS",
  layers: [],
  failures: [],
  totals: {
    layers: 0,
    sources: 0,
    evidence: 0,
    signals: 0,
    score_components: 0
  }
};

for (const layer of LAYERS) {

  const checkpointPath = path.join(
    ROOT,
    "public/data/intelligence/checkpoints",
    `${layer.toLowerCase()}_operational_complete_lock.json`
  );

  if (!fs.existsSync(checkpointPath)) {
    report.status = "FAIL";
    report.failures.push(`${layer}_MISSING_CHECKPOINT`);
    continue;
  }

  const checkpoint = readJson(checkpointPath);

  const outputCandidates = [
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_FEDERAL_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_STATE_PUBLIC_SAFETY_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_LOCAL_OPERATIONAL_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_PRIVATE_SECTOR_COMMERCIAL_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_BEHAVIORAL_DEMAND_SIGNAL_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_ASSET_INFRASTRUCTURE_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_GEOGRAPHIC_TERRITORY.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_COMMAND_STRUCTURE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_CONTACT_DECISION_MAKER_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_COMMUNICATION_OUTREACH_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_RISK_COMPLIANCE_LEGAL_INTELLIGENCE.normalized.json`
    ),
    path.join(
      ROOT,
      "public/data/intelligence/outputs",
      `${layer}_ENGAGEMENT_RESPONSE_CONVERSION_INTELLIGENCE.normalized.json`
    )
  ];

  const outputPath = outputCandidates.find(p => fs.existsSync(p));

  if (!outputPath) {
    report.status = "FAIL";
    report.failures.push(`${layer}_MISSING_OUTPUT`);
    continue;
  }

  const output = readJson(outputPath);

  const layerReport = {
    layer_id: layer,
    checkpoint_exists: true,
    completion_status: checkpoint.completion_status,
    output_file: path.relative(ROOT, outputPath),
    output_sha256: sha256(outputPath),
    sources: checkpoint.counts.sources,
    evidence: output.evidence.length,
    signals: output.signals.length,
    score_components: output.score_components.length,
    dossier_fields: output.dossier_fields.length
  };

  if (checkpoint.completion_status !== "COMPLETE") {
    report.status = "FAIL";
    report.failures.push(`${layer}_INCOMPLETE`);
  }

  if (output.evidence.length !== 15) {
    report.status = "FAIL";
    report.failures.push(`${layer}_EVIDENCE_COUNT_INVALID`);
  }

  if (output.signals.length !== 15) {
    report.status = "FAIL";
    report.failures.push(`${layer}_SIGNAL_COUNT_INVALID`);
  }

  if (output.score_components.length !== 15) {
    report.status = "FAIL";
    report.failures.push(`${layer}_SCORE_COMPONENT_COUNT_INVALID`);
  }

  report.layers.push(layerReport);

  report.totals.layers += 1;
  report.totals.sources += checkpoint.counts.sources;
  report.totals.evidence += output.evidence.length;
  report.totals.signals += output.signals.length;
  report.totals.score_components += output.score_components.length;
}

const outPath = path.join(
  ROOT,
  "public/data/intelligence/audit/master_12_layer_integrity_audit.json"
);

fs.mkdirSync(path.dirname(outPath), { recursive: true });

fs.writeFileSync(
  outPath,
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
