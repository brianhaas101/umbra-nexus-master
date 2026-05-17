const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/data/intelligence/outputs");
const OUT = path.join(OUT_DIR, "L10_contact_score_refinement.json");

const CANDIDATE_ROOTS = [
  path.join(ROOT, "public/data/intelligence/outputs"),
  path.join(ROOT, "public/data/intelligence"),
  path.join(ROOT, "public/data/clients"),
  path.join(ROOT, "public/data")
];

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(full, acc);
      continue;
    }

    if (
      item.isFile() &&
      item.name.endsWith(".json") &&
      /L10|contact|communication|outreach/i.test(item.name) &&
      !/L10_contact_score_refinement|L10_outreach_readiness_synthesis/i.test(item.name)
    ) {
      acc.push(full);
    }
  }

  return acc;
}

function flattenRecords(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (Array.isArray(value.entities)) return value.entities;
  if (Array.isArray(value.records)) return value.records;
  if (Array.isArray(value.contacts)) return value.contacts;
  if (Array.isArray(value.signals)) return value.signals;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.data)) return value.data;

  return [];
}

function stableId(seed) {
  return "ent_" + crypto
    .createHash("sha256")
    .update(String(seed))
    .digest("hex")
    .slice(0, 16);
}

function clamp(n, min = 0, max = 100) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function hasValue(v) {
  return v !== undefined && v !== null && String(v).trim() !== "";
}

function normalizeRecord(raw, sourceFile, index) {
  const agency =
    raw.agency ||
    raw.agency_name ||
    raw.organization ||
    raw.organization_name ||
    raw.entity_name ||
    raw.name ||
    raw.title ||
    "unknown_agency";

  const city = raw.city || raw.locality || raw.region || raw.state || "unknown_region";

  const email =
    raw.email ||
    raw.work_email ||
    raw.contact_email ||
    raw.primary_email ||
    raw.channel_email ||
    null;

  const phone =
    raw.phone ||
    raw.work_phone ||
    raw.direct_phone ||
    raw.contact_phone ||
    raw.primary_phone ||
    null;

  const role =
    raw.role ||
    raw.title ||
    raw.contact_role ||
    raw.position ||
    raw.department ||
    "unknown_role";

  const entity_id =
    raw.entity_id ||
    raw.id ||
    raw.agency_id ||
    stableId(`${agency}|${city}|${email || phone || role}|${sourceFile}|${index}`);

  const emailScore = hasValue(email) ? 32 : 0;
  const phoneScore = hasValue(phone) ? 28 : 0;

  const roleText = String(role).toLowerCase();
  const authorityScore =
    /chief|sheriff|commander|captain|lieutenant|training|procurement|director|administrator|admin/.test(roleText)
      ? 24
      : hasValue(role)
        ? 12
        : 0;

  const freshness =
    clamp(
      raw.freshness_score ??
      raw.contact_freshness_score ??
      raw.source_freshness_score ??
      raw.score ??
      16,
      0,
      16
    );

  const contact_score = clamp(emailScore + phoneScore + authorityScore + freshness, 0, 100);

  const outreach_ready = contact_score >= 60 && (hasValue(email) || hasValue(phone));

  return {
    layer_id: "L10",
    layer_name: "communication_and_outreach_readiness",
    entity_id,
    agency,
    city,
    contact: {
      name: raw.contact_name || raw.name || null,
      role,
      email,
      phone
    },
    contact_score,
    score: contact_score,
    contact_confidence: clamp(contact_score / 100, 0, 1),
    outreach_ready,
    readiness_class:
      contact_score >= 80 ? "HIGH" :
      contact_score >= 60 ? "READY" :
      contact_score >= 40 ? "PARTIAL" :
      "REVIEW",
    signals: [
      {
        signal_id: stableId(`sig|${entity_id}|L10_contact_score_refinement`),
        layer_id: "L10",
        signal_type: "contact_score_refinement",
        value: contact_score,
        confidence: clamp(contact_score / 100, 0, 1)
      }
    ],
    evidence: [
      {
        evidence_id: stableId(`ev|${entity_id}|${sourceFile}`),
        layer_id: "L10",
        source_file: path.relative(ROOT, sourceFile).replace(/\\/g, "/"),
        evidence_type: "contact_refinement_input",
        confidence: clamp(contact_score / 100, 0, 1)
      }
    ],
    score_components: [
      {
        layer_id: "L10",
        component: "email_presence",
        value: emailScore
      },
      {
        layer_id: "L10",
        component: "phone_presence",
        value: phoneScore
      },
      {
        layer_id: "L10",
        component: "role_authority",
        value: authorityScore
      },
      {
        layer_id: "L10",
        component: "freshness",
        value: freshness
      }
    ],
    _source: "L10_contact_score_refinement",
    _version: "nexus_L10_contact_score_refinement_v1"
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = [...new Set(CANDIDATE_ROOTS.flatMap(root => walk(root)))];

const records = [];

for (const file of files) {
  const json = readJson(file);
  const flattened = flattenRecords(json);

  flattened.forEach((raw, index) => {
    if (raw && typeof raw === "object") {
      records.push(normalizeRecord(raw, file, index));
    }
  });
}

const deduped = new Map();

for (const record of records) {
  if (!deduped.has(record.entity_id)) {
    deduped.set(record.entity_id, record);
    continue;
  }

  const existing = deduped.get(record.entity_id);
  if ((record.contact_score || 0) > (existing.contact_score || 0)) {
    deduped.set(record.entity_id, record);
  }
}

const output = Array.from(deduped.values())
  .sort((a, b) => {
    if (b.contact_score !== a.contact_score) return b.contact_score - a.contact_score;
    return String(a.entity_id).localeCompare(String(b.entity_id));
  });

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[L10 CONTACT SCORE REFINEMENT] COMPLETE", output.length);
console.log("[L10 CONTACT SCORE REFINEMENT] OUTPUT", path.relative(ROOT, OUT).replace(/\\/g, "/"));

if (output.length === 0) {
  console.warn("[L10 CONTACT SCORE REFINEMENT] WARNING: no L10/contact source records found");
}
