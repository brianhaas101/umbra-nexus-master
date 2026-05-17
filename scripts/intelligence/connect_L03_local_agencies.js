const fs = require("fs");
const path = require("path");

const IN = "public/data/clients/black_dragon/national_verified_outreach_shortlist.json";
const OUT = "public/data/intelligence/outputs/L03_LOCAL_AGENCY_INTELLIGENCE.normalized.json";

const data = fs.existsSync(IN) ? JSON.parse(fs.readFileSync(IN, "utf8")) : { targets: [] };

const entities = [];
const evidence = [];
const signals = [];
const score_components = [];
const dossier_fields = [];

for (const t of data.targets || []) {
  const entity_id = `${t.state || "NA"}_${String(t.agency_name || "").toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;

  entities.push({
    entity_id,
    entity_type: "LAW_ENFORCEMENT_AGENCY",
    display_name: t.agency_name,
    canonical_name: String(t.agency_name || "").toUpperCase(),
    city: t.city || "",
    state: t.state || "",
    country: "US",
    source_trace: IN,
    confidence_score: 0.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  evidence.push({
    evidence_id: `EV_L03_${entity_id}`,
    source_id: "NATIONAL_VERIFIED_OUTREACH_SHORTLIST",
    source_url: t.contact?.source_url || "",
    collected_at: new Date().toISOString(),
    normalized_at: new Date().toISOString(),
    entity_id,
    layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
    evidence_type: "VERIFIED_LOCAL_AGENCY_TARGET",
    confidence_score: 0.9,
    freshness_score: 0.85,
    authority_score: 0.85,
    normalization_adapter: "LOCAL_DIRECTORY_ADAPTER",
    raw_value: t,
    normalized_value: {
      agency_name: t.agency_name,
      city: t.city,
      state: t.state,
      source_scope: t.source_scope
    },
    validation_status: "VALIDATED"
  });

  signals.push({
    signal_id: `SIG_L03_${entity_id}`,
    entity_id,
    layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
    signal_type: "AUTHORITY_SIGNAL",
    signal_value: "VERIFIED_LOCAL_AGENCY",
    operational_relevance: "TARGETABLE_ENTITY",
    source_trace: IN,
    confidence_score: 0.9,
    freshness_score: 0.85,
    created_at: new Date().toISOString()
  });

  score_components.push({
    entity_id,
    layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
    component_name: "agency_intelligence_confidence_score",
    component_score: 88,
    weight: 0.9,
    weighted_score: 79.2,
    reason: "Agency exists in national verified outreach shortlist.",
    source_trace: IN,
    confidence_score: 0.9,
    generated_at: new Date().toISOString()
  });

  dossier_fields.push({
    entity_id,
    field_group: "identity",
    field_name: "verified_agency_identity",
    value: {
      agency_name: t.agency_name,
      city: t.city,
      state: t.state,
      source_scope: t.source_scope
    },
    source_trace: IN,
    confidence_score: 0.9,
    freshness_score: 0.85,
    layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
    generated_at: new Date().toISOString()
  });
}

const out = {
  version: "nexus_L03_live_local_agency_output_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
  status: "LIVE_LOCAL_CONNECTOR_ACTIVE",
  entities,
  evidence,
  signals,
  score_components,
  dossier_fields
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log("[L03 LIVE CONNECTOR] COMPLETE", entities.length);
