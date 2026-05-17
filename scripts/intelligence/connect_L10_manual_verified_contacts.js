const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/outputs/L10_COMMUNICATION_INTELLIGENCE.normalized.json";
const SOURCES = [
  "public/data/clients/black_dragon/manual_verified_contacts.json",
  "public/data/clients/black_dragon/state_candidates/ca_verified_contacts.json",
  "public/data/clients/black_dragon/state_candidates/tx_verified_contacts.json"
];

function read(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const entities = [];
const evidence = [];
const signals = [];
const score_components = [];
const dossier_fields = [];

for (const sourcePath of SOURCES) {
  const data = read(sourcePath, { contacts: [] });

  for (const c of data.contacts || []) {
    const entity_id = `${c.state || "NA"}_${String(c.agency_name || "").toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;

    entities.push({
      entity_id,
      entity_type: "LAW_ENFORCEMENT_AGENCY",
      display_name: c.agency_name,
      canonical_name: String(c.agency_name || "").toUpperCase(),
      city: c.city || "",
      state: c.state || "",
      country: c.country || "US",
      source_trace: sourcePath,
      confidence_score: 0.95,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    evidence.push({
      evidence_id: `EV_L10_${entity_id}`,
      source_id: "VERIFIED_MANUAL_CONTACTS",
      source_url: c.verified_contact?.source_url || "",
      collected_at: c.verified_contact?.verified_at || new Date().toISOString(),
      normalized_at: new Date().toISOString(),
      entity_id,
      layer_id: "L10_COMMUNICATION_INTELLIGENCE",
      evidence_type: "VERIFIED_CONTACT_PATH",
      confidence_score: 0.95,
      freshness_score: 0.85,
      authority_score: 0.9,
      normalization_adapter: "MANUAL_VERIFIED_CONTACT_ADAPTER",
      raw_value: c,
      normalized_value: {
        phone: c.verified_contact?.phone || "",
        email: c.verified_contact?.email || "",
        department: c.verified_contact?.department || "",
        contact_path: c.contact_path || {}
      },
      validation_status: "VALIDATED"
    });

    signals.push({
      signal_id: `SIG_L10_${entity_id}`,
      entity_id,
      layer_id: "L10_COMMUNICATION_INTELLIGENCE",
      signal_type: "COMMUNICATION_SIGNAL",
      signal_value: "VERIFIED_CONTACT_PATH",
      operational_relevance: "OUTREACH_READY",
      source_trace: sourcePath,
      confidence_score: 0.95,
      freshness_score: 0.85,
      created_at: new Date().toISOString()
    });

    score_components.push({
      entity_id,
      layer_id: "L10_COMMUNICATION_INTELLIGENCE",
      component_name: "outreach_readiness_score",
      component_score: 90,
      weight: 0.75,
      weighted_score: 67.5,
      reason: "Verified phone-first or direct contact path exists.",
      source_trace: sourcePath,
      confidence_score: 0.95,
      generated_at: new Date().toISOString()
    });

    dossier_fields.push({
      entity_id,
      field_group: "communication",
      field_name: "verified_contact_path",
      value: {
        phone: c.verified_contact?.phone || "",
        email: c.verified_contact?.email || "",
        department: c.verified_contact?.department || "",
        route: c.contact_path?.primary_route || ""
      },
      source_trace: sourcePath,
      confidence_score: 0.95,
      freshness_score: 0.85,
      layer_id: "L10_COMMUNICATION_INTELLIGENCE",
      generated_at: new Date().toISOString()
    });
  }
}

const out = {
  version: "nexus_L10_live_manual_verified_contact_output_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L10_COMMUNICATION_INTELLIGENCE",
  status: "LIVE_LOCAL_CONNECTOR_ACTIVE",
  entities,
  evidence,
  signals,
  score_components,
  dossier_fields
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log("[L10 LIVE CONNECTOR] COMPLETE", entities.length);
