import fs from "node:fs";
import path from "node:path";
import { replayHash } from "./l01_replay_hash.js";

const LOCKED_FRAGMENTS = Object.freeze([
  "public/scene.js",
  "public/globe/textures.js",
  "public/globe/layers.js",
  "index.html",
  "public/data/clients/black_dragon",
  "public/globe/clients/black_dragon"
]);

export function assertNoBlackDragonReference(value, context = "unknown") {
  const text = JSON.stringify(value ?? "").replaceAll("\\", "/").toLowerCase();

  for (const locked of LOCKED_FRAGMENTS) {
    if (text.includes(locked.toLowerCase())) {
      throw new Error(`Black Dragon reference blocked in ${context}: ${locked}`);
    }
  }

  return true;
}

export function readJsonSafe(filePath) {
  assertNoBlackDragonReference(filePath, "filePath");
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const parsed = JSON.parse(raw);
  assertNoBlackDragonReference(parsed, filePath);
  return parsed;
}

export function validateRawEnvelope(record) {
  const required = [
    "layer_id",
    "source_id",
    "source_name",
    "canonical_url",
    "retrieved_at",
    "raw_record_type",
    "raw_payload",
    "source_trace"
  ];

  const errors = [];

  for (const field of required) {
    if (record[field] === undefined || record[field] === null || record[field] === "") {
      errors.push(`missing:${field}`);
    }
  }

  if (record.layer_id !== "L01") errors.push("invalid:layer_id");

  try {
    const url = new URL(String(record.canonical_url));
    if (url.protocol !== "https:") errors.push("invalid:canonical_url_protocol");
  } catch {
    errors.push("invalid:canonical_url");
  }

  const date = new Date(record.retrieved_at);
  if (Number.isNaN(date.getTime())) errors.push("invalid:retrieved_at");

  if (record.synthetic_fillers_allowed === true) errors.push("blocked:synthetic_fillers");
  if (record.inferred_contacts_allowed === true) errors.push("blocked:inferred_contacts");
  if (record.runtime_promotion === true) errors.push("blocked:runtime_promotion");

  assertNoBlackDragonReference(record, "rawEnvelope");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    replay_hash: replayHash(record)
  });
}

export function makeRawEnvelope(source, rawPayload, rawRecordType = "federal_source_record") {
  const now = new Date().toISOString();

  const envelope = Object.freeze({
    layer_id: "L01",
    source_id: source.source_id,
    source_name: source.source_name,
    canonical_url: source.canonical_url,
    retrieved_at: now,
    raw_record_type: rawRecordType,
    raw_payload: rawPayload,
    source_trace: Object.freeze({
      canonical_url: source.canonical_url,
      retrieved_at: now,
      access_method: source.access_method,
      connector_id: `${source.source_id}_connector`
    }),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    runtime_promotion: false,
    black_dragon_coupling: false
  });

  const validation = validateRawEnvelope(envelope);

  if (!validation.valid) {
    throw new Error(`Invalid raw envelope: ${validation.errors.join(",")}`);
  }

  return envelope;
}
