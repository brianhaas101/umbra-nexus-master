const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const contactsPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const trackingPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json"
);

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/outreach_priority_model.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));
const tracking = JSON.parse(fs.readFileSync(trackingPath, "utf8"));
const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));

const weights = model.weights;
const tempWeights = model.temperature_weights;
const readinessWeights = model.readiness_weights;
const thresholds = model.priority_thresholds;

const contactMap = new Map(
  contacts.map(c => [c.entity_id, c])
);

const trackingMap = new Map(
  tracking.map(t => [t.entity_id, t])
);

function clamp(n) {
  return Math.max(0, Math.min(100, Number(n.toFixed(2))));
}

function readiness(contact) {

  if (!contact) return "NOT_READY";

  if (
    contact.has_public_email ||
    contact.has_public_phone ||
    contact.has_public_form
  ) {
    return "READY";
  }

  if (contact.has_social_route) {
    return "PARTIAL";
  }

  return "NOT_READY";
}

function priorityTier(score) {

  if (score >= thresholds.CRITICAL) return "CRITICAL";
  if (score >= thresholds.HIGH) return "HIGH";
  if (score >= thresholds.MEDIUM) return "MEDIUM";
  if (score >= thresholds.LOW) return "LOW";

  return "NONE";
}

const priorityIndex = operational.map(target => {

  const contact =
    contactMap.get(target.entity_id);

  const track =
    trackingMap.get(target.entity_id);

  const propagation_score =
    target.propagation_score || 0;

  const contactability_score =
    contact
      ? contact.contactability_score || 0
      : 0;

  const lead_temperature =
    target.lead_temperature || "REVIEW";

  const readiness_state =
    readiness(contact);

  const temperature_value =
    tempWeights[lead_temperature] || 0;

  const readiness_value =
    readinessWeights[readiness_state] || 0;

  const unified_priority_score = clamp(

    (propagation_score * weights.propagation_score) +
    (contactability_score * weights.contactability_score) +
    (temperature_value * weights.lead_temperature) +
    (readiness_value * weights.outreach_readiness)

  );

  return {

    entity_id: target.entity_id,

    organization_name:
      target.organization_name,

    target_name:
      target.target_name || "UNKNOWN_LEADER",

    leader_role:
      target.leader_role || "UNKNOWN",

    organization_type:
      target.organization_type || "UNKNOWN",

    propagation_score,

    contactability_score,

    lead_temperature,

    readiness_state,

    outreach_status:
      track
        ? track.outreach_status
        : "NOT_CONTACTED",

    unified_priority_score,

    unified_priority_tier:
      priorityTier(unified_priority_score),

    recommended_action:

      unified_priority_score >= 85
        ? "IMMEDIATE_OUTREACH"

      : unified_priority_score >= 70
        ? "HIGH_PRIORITY_OUTREACH"

      : unified_priority_score >= 50
        ? "QUEUE_FOR_OUTREACH"

      : unified_priority_score > 0
        ? "MONITOR_AND_ENRICH"

      : "INSUFFICIENT_DATA",

    generated_at:
      new Date().toISOString()
  };

});

priorityIndex.sort(
  (a,b) =>
    (b.unified_priority_score || 0) -
    (a.unified_priority_score || 0)
);

const payload = {
  version: "black_dragon_books_contactability_weighted_priority_index_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: priorityIndex.length,

    critical:
      priorityIndex.filter(p => p.unified_priority_tier === "CRITICAL").length,

    high:
      priorityIndex.filter(p => p.unified_priority_tier === "HIGH").length,

    medium:
      priorityIndex.filter(p => p.unified_priority_tier === "MEDIUM").length,

    low:
      priorityIndex.filter(p => p.unified_priority_tier === "LOW").length,

    none:
      priorityIndex.filter(p => p.unified_priority_tier === "NONE").length
  },

  top_operational_targets:
    priorityIndex.slice(0, 25),

  targets:
    priorityIndex
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status: "CONTACTABILITY_WEIGHTED_PRIORITY_INDEX_COMPLETE",
  totals: payload.totals,
  output: outputPath
}, null, 2));
