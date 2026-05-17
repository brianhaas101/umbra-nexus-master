const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const REGISTRY_PATH = path.join(ROOT, "public/data/intelligence/outputs/normalization.registry.json");
const NATIONAL_PATH = path.join(ROOT, "public/data/clients/black_dragon/national_verified_outreach_shortlist.json");
const OUT_PATH = path.join(ROOT, "public/data/clients/black_dragon/normalized_intelligence_outputs.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function slug(v) {
  return String(v || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function entityId(target) {
  return `BD_${slug(target.state)}_${slug(target.agency_name)}`;
}

function main() {
  const registry = readJson(REGISTRY_PATH);
  const national = readJson(NATIONAL_PATH);

  const entities = [];
  const evidence = [];
  const signals = [];
  const score_components = [];
  const dossier_fields = [];

  for (const target of national.targets || []) {
    const id = entityId(target);
    const sourceTrace = [
      target.contact?.source_url,
      target.contact?.secondary_source_url
    ].filter(Boolean);

    entities.push({
      entity_id: id,
      agency_name: target.agency_name,
      entity_type: "LAW_ENFORCEMENT_AGENCY",
      city: target.city || "",
      state: target.state,
      country: "US",
      source_trace: sourceTrace,
      confidence: 0.9
    });

    evidence.push({
      evidence_id: `${id}_L10_CONTACT_PATH`,
      entity_id: id,
      layer_id: "L10_COMMUNICATION_CHANNELS",
      source_url: target.contact?.source_url || "",
      source_type: "official_contact_or_training_page",
      claim: "Verified official phone-first contact path exists.",
      observed_value: target.contact?.phone || "",
      verified_at: national.generated_at,
      confidence: 0.9
    });

    signals.push({
      signal_id: `${id}_TRAINING_ROUTE`,
      entity_id: id,
      layer_id: "L04_TRAINING_INFRASTRUCTURE",
      signal_type: "TRAINING_OR_COMMAND_ROUTE",
      signal_value: target.contact?.department || "",
      operational_relevance: "Supports Black Dragon training outreach routing.",
      confidence: 0.85
    });

    score_components.push({
      entity_id: id,
      layer_id: "L10_COMMUNICATION_CHANNELS",
      component_name: "verified_contact_path",
      component_score: 90,
      weight: 0.6,
      reason: "Manual verified official phone path exists."
    });

    score_components.push({
      entity_id: id,
      layer_id: "L04_TRAINING_INFRASTRUCTURE",
      component_name: "training_relevance",
      component_score: target.contact?.department ? 85 : 65,
      weight: 0.8,
      reason: "Training, command, academy, or routing path identified."
    });

    dossier_fields.push({
      entity_id: id,
      field_group: "agency_identity",
      field_name: "agency_name",
      value: target.agency_name,
      source_trace: sourceTrace,
      confidence: 0.9
    });

    dossier_fields.push({
      entity_id: id,
      field_group: "contact_path",
      field_name: "primary_phone",
      value: target.contact?.phone || "",
      source_trace: sourceTrace,
      confidence: 0.9
    });

    dossier_fields.push({
      entity_id: id,
      field_group: "training_relevance",
      field_name: "training_or_command_route",
      value: target.contact?.department || "",
      source_trace: sourceTrace,
      confidence: 0.85
    });
  }

  const output = {
    version: "black_dragon_normalized_intelligence_outputs_v1",
    generated_at: new Date().toISOString(),
    registry_version: registry.version,
    source: "national_verified_outreach_shortlist.json",
    counts: {
      entities: entities.length,
      evidence: evidence.length,
      signals: signals.length,
      score_components: score_components.length,
      dossier_fields: dossier_fields.length
    },
    entities,
    evidence,
    signals,
    score_components,
    dossier_fields
  };

  writeJson(OUT_PATH, output);

  console.log("[NORMALIZE] COMPLETE");
  console.log("[NORMALIZE] Entities:", entities.length);
  console.log("[NORMALIZE] Evidence:", evidence.length);
  console.log("[NORMALIZE] Signals:", signals.length);
  console.log("[NORMALIZE] Score components:", score_components.length);
  console.log("[NORMALIZE] Dossier fields:", dossier_fields.length);
  console.log("[NORMALIZE] Output:", OUT_PATH);
}

main();
