/*
  UMBRA NEXUS — Layer 01
  Provenance Intake Layer
  COMPLETE LOCKED
  Isolated. Deterministic. No Black Dragon imports.
*/

const REQUIRED_FIELDS = Object.freeze([
  "source_url",
  "source_type",
  "source_title",
  "retrieved_at",
  "city",
  "entity",
  "claim"
]);

const REJECTED_FIELDS = Object.freeze([
  "synthetic_contact",
  "inferred_email",
  "unsourced_claim",
  "runtime_generated_entity",
  "runtime_promotion",
  "black_dragon_runtime_reference"
]);

export function processLayer01(record) {
  const rejectionReasons = [];

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return rejected(null, ["invalid_record_object"]);
  }

  for (const field of REQUIRED_FIELDS) {
    if (isBlank(record[field])) {
      rejectionReasons.push(`missing_required_field:${field}`);
    }
  }

  for (const field of REJECTED_FIELDS) {
    if (record[field] !== undefined && record[field] !== null && record[field] !== false) {
      rejectionReasons.push(`rejected_field_present:${field}`);
    }
  }

  if (!isValidUrl(record.source_url)) {
    rejectionReasons.push("invalid_source_url");
  }

  if (!isValidTimestamp(record.retrieved_at)) {
    rejectionReasons.push("invalid_retrieved_at");
  }

  if (rejectionReasons.length > 0) {
    return rejected(record, rejectionReasons);
  }

  const normalized = normalizeRecord(record);

  return Object.freeze({
    layer_id: "layer_01",
    record_id: deterministicRecordId(normalized),
    normalized_record: normalized,
    provenance_status: "accepted_with_source",
    accepted: true,
    rejection_reasons: Object.freeze([]),
    audit_timestamp: new Date().toISOString()
  });
}

function rejected(record, reasons) {
  return Object.freeze({
    layer_id: "layer_01",
    record_id: record ? deterministicRecordId(record) : null,
    normalized_record: null,
    provenance_status: "rejected",
    accepted: false,
    rejection_reasons: Object.freeze(reasons),
    audit_timestamp: new Date().toISOString()
  });
}

export function normalizeRecord(record) {
  return Object.freeze({
    source_url: String(record.source_url).trim(),
    source_type: String(record.source_type).trim(),
    source_title: String(record.source_title).trim(),
    retrieved_at: new Date(record.retrieved_at).toISOString(),
    city: String(record.city).trim(),
    entity: String(record.entity).trim(),
    claim: String(record.claim).trim(),
    confidence: clamp(Number(record.confidence ?? 0), 0, 100)
  });
}

export function deterministicRecordId(record) {
  const basis = [
    record?.source_url,
    record?.city,
    record?.entity,
    record?.claim
  ].map(value => String(value || "").trim().toLowerCase()).join("|");

  let hash = 2166136261;

  for (let i = 0; i < basis.length; i++) {
    hash ^= basis.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `l01_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isValidUrl(value) {
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidTimestamp(value) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}
