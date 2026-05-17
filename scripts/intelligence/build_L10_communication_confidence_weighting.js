const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/data/intelligence/outputs");
const IN = path.join(OUT_DIR, "L10_contact_score_refinement.json");
const OUT = path.join(OUT_DIR, "L10_communication_confidence_weighting.json");

function stableId(seed) {
  return "sig_" + crypto
    .createHash("sha256")
    .update(String(seed))
    .digest("hex")
    .slice(0, 16);
}

function clamp(n, min = 0, max = 1) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function readArray(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[L10 COMM CONFIDENCE] Missing input: ${filePath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.records)) return parsed.records;
  if (Array.isArray(parsed.entities)) return parsed.entities;
  if (Array.isArray(parsed.signals)) return parsed.signals;

  return [];
}

function hasValue(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const input = readArray(IN);

const output = input.map((record, index) => {
  const entity_id = record.entity_id || record.id || `l10_unknown_${index}`;

  const contact = record.contact || {};
  const email = contact.email || record.email || record.work_email || null;
  const phone = contact.phone || record.phone || record.work_phone || record.direct_phone || null;
  const role = contact.role || record.role || record.title || null;

  const contactScore = Number(record.contact_score ?? record.score ?? 0);

  const channelCompleteness =
    (hasValue(email) ? 0.35 : 0) +
    (hasValue(phone) ? 0.3 : 0) +
    (hasValue(role) ? 0.2 : 0) +
    (hasValue(record.agency) || hasValue(record.agency_name) ? 0.15 : 0);

  const confidenceFromScore = clamp(contactScore / 100, 0, 1);
  const sourceConfidence = clamp(record.contact_confidence ?? record.confidence ?? confidenceFromScore, 0, 1);

  const communication_confidence = clamp(
    (channelCompleteness * 0.45) +
    (confidenceFromScore * 0.35) +
    (sourceConfidence * 0.2),
    0,
    1
  );

  return {
    layer_id: "L10",
    layer_name: "communication_and_outreach_readiness",
    entity_id,
    agency: record.agency || record.agency_name || record.organization || null,
    city: record.city || record.region || null,
    communication_confidence,
    confidence_weight: communication_confidence,
    confidence_class:
      communication_confidence >= 0.85 ? "HIGH_CONFIDENCE" :
      communication_confidence >= 0.65 ? "USABLE_CONFIDENCE" :
      communication_confidence >= 0.45 ? "PARTIAL_CONFIDENCE" :
      "REVIEW_REQUIRED",
    outreach_ready: Boolean(record.outreach_ready),
    contact_score: contactScore,
    contact: {
      name: contact.name || record.contact_name || null,
      role,
      email,
      phone
    },
    signals: [
      {
        signal_id: stableId(`${entity_id}|L10_communication_confidence_weighting`),
        layer_id: "L10",
        signal_type: "communication_confidence_weighting",
        value: communication_confidence,
        confidence: communication_confidence
      }
    ],
    evidence: [
      {
        evidence_id: stableId(`${entity_id}|L10_contact_score_refinement|confidence_weighting`),
        layer_id: "L10",
        source_file: "public/data/intelligence/outputs/L10_contact_score_refinement.json",
        evidence_type: "derived_confidence_weighting",
        confidence: communication_confidence
      }
    ],
    score_components: [
      {
        layer_id: "L10",
        component: "channel_completeness",
        value: Number(channelCompleteness.toFixed(4))
      },
      {
        layer_id: "L10",
        component: "confidence_from_contact_score",
        value: Number(confidenceFromScore.toFixed(4))
      },
      {
        layer_id: "L10",
        component: "source_confidence",
        value: Number(sourceConfidence.toFixed(4))
      }
    ],
    _source: "L10_communication_confidence_weighting",
    _version: "nexus_L10_communication_confidence_weighting_v1"
  };
}).sort((a, b) => {
  if (b.communication_confidence !== a.communication_confidence) {
    return b.communication_confidence - a.communication_confidence;
  }
  return String(a.entity_id).localeCompare(String(b.entity_id));
});

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[L10 COMMUNICATION CONFIDENCE WEIGHTING] COMPLETE", output.length);
console.log("[L10 COMMUNICATION CONFIDENCE WEIGHTING] OUTPUT", path.relative(ROOT, OUT).replace(/\\/g, "/"));
