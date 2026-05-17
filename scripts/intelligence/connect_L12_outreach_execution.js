const fs = require("fs");
const path = require("path");

const IN = "public/data/clients/black_dragon/outreach_execution_log.json";
const OUT = "public/data/intelligence/outputs/L12_ENGAGEMENT_RESPONSE.normalized.json";

const data = fs.existsSync(IN) ? JSON.parse(fs.readFileSync(IN, "utf8")) : { targets: [] };

const entities = [];
const evidence = [];
const signals = [];
const score_components = [];
const dossier_fields = [];

for (const t of data.targets || []) {
  const entity_id = `${t.state || "NA"}_${String(t.agency_name || "").toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;

  evidence.push({
    evidence_id: `EV_L12_${entity_id}`,
    source_id: "OUTREACH_EXECUTION_LOG",
    source_url: IN,
    collected_at: t.last_contacted || new Date().toISOString(),
    normalized_at: new Date().toISOString(),
    entity_id,
    layer_id: "L12_ENGAGEMENT_RESPONSE",
    evidence_type: "OUTREACH_EXECUTION_STATE",
    confidence_score: 0.85,
    freshness_score: 0.9,
    authority_score: 0.85,
    normalization_adapter: "OUTREACH_EXECUTION_LOG_ADAPTER",
    raw_value: t,
    normalized_value: {
      status: t.status,
      attempts: t.attempts,
      last_contacted: t.last_contacted,
      notes: t.notes
    },
    validation_status: "VALIDATED"
  });

  signals.push({
    signal_id: `SIG_L12_${entity_id}`,
    entity_id,
    layer_id: "L12_ENGAGEMENT_RESPONSE",
    signal_type: "ENGAGEMENT_SIGNAL",
    signal_value: t.status || "NEW",
    operational_relevance: "FOLLOW_UP_TRACKING",
    source_trace: IN,
    confidence_score: 0.85,
    freshness_score: 0.9,
    created_at: new Date().toISOString()
  });

  score_components.push({
    entity_id,
    layer_id: "L12_ENGAGEMENT_RESPONSE",
    component_name: "follow_up_priority_score",
    component_score: t.status === "NEW" ? 70 : 50,
    weight: 0.75,
    weighted_score: t.status === "NEW" ? 52.5 : 37.5,
    reason: "Engagement state derived from outreach execution log.",
    source_trace: IN,
    confidence_score: 0.85,
    generated_at: new Date().toISOString()
  });

  dossier_fields.push({
    entity_id,
    field_group: "engagement",
    field_name: "outreach_execution_state",
    value: {
      status: t.status,
      attempts: t.attempts,
      last_contacted: t.last_contacted,
      notes: t.notes
    },
    source_trace: IN,
    confidence_score: 0.85,
    freshness_score: 0.9,
    layer_id: "L12_ENGAGEMENT_RESPONSE",
    generated_at: new Date().toISOString()
  });
}

const out = {
  version: "nexus_L12_live_engagement_output_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L12_ENGAGEMENT_RESPONSE",
  status: "LIVE_LOCAL_CONNECTOR_ACTIVE",
  entities,
  evidence,
  signals,
  score_components,
  dossier_fields
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));

console.log("[L12 LIVE CONNECTOR] COMPLETE", signals.length);
