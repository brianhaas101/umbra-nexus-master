const fs = require("fs");
const path = require("path");

const priorityPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const responsesPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_model.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const priority = JSON.parse(fs.readFileSync(priorityPath, "utf8"));
const responses = JSON.parse(fs.readFileSync(responsesPath, "utf8"));
const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));

const adjustments = model.response_adjustments;

const responseMap = new Map(
  (responses.responses || []).map(r => [r.entity_id, r])
);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function adaptiveTier(score) {

  const t = model.adaptive_tiers;

  if (score >= t.CRITICAL) return "CRITICAL";
  if (score >= t.HIGH) return "HIGH";
  if (score >= t.MEDIUM) return "MEDIUM";
  if (score >= t.LOW) return "LOW";

  return "NONE";
}

function adaptiveAction(score, responseClass) {

  if (responseClass === "CONVERSION_CONFIRMED") {
    return "MAINTAIN_RELATIONSHIP_AND_TRACK_PROPAGATION";
  }

  if (responseClass === "BULK_ORDER_SIGNAL") {
    return "PRIORITIZE_GROUP_ORDER_EXECUTION";
  }

  if (responseClass === "ENDORSEMENT_SIGNAL") {
    return "TRACK_DOWNSTREAM_PROPAGATION";
  }

  if (responseClass === "INTEREST_SIGNAL") {
    return "HIGH_PRIORITY_FOLLOWUP";
  }

  if (score >= 85) {
    return "IMMEDIATE_OPERATIONAL_ATTENTION";
  }

  if (score >= 70) {
    return "ACTIVE_OUTREACH_PRIORITY";
  }

  if (score >= 50) {
    return "CONTINUE_ENGAGEMENT";
  }

  if (score > 0) {
    return "MONITOR_AND_ENRICH";
  }

  return "ARCHIVE_OR_SUPPRESS";
}

const adaptiveTargets = priority.targets.map(target => {

  const response =
    responseMap.get(target.entity_id);

  const baseScore =
    Number(target.unified_priority_score || 0);

  const responseClass =
    response
      ? response.response_classification
      : null;

  const adjustment =
    responseClass
      ? (adjustments[responseClass] || 0)
      : 0;

  const followupBonus =
    response && response.followup_required
      ? model.followup_bonus
      : 0;

  const adaptivePriorityScore = clamp(
    baseScore + adjustment + followupBonus,
    model.min_priority,
    model.max_priority
  );

  return {

    entity_id: target.entity_id,
    organization_name: target.organization_name,
    target_name: target.target_name,
    leader_role: target.leader_role,
    organization_type: target.organization_type,

    prior_priority_score: baseScore,
    adaptive_priority_score: adaptivePriorityScore,

    adaptive_priority_delta:
      adaptivePriorityScore - baseScore,

    adaptive_priority_tier:
      adaptiveTier(adaptivePriorityScore),

    response_status:
      response
        ? response.response_status
        : null,

    response_classification:
      responseClass,

    propagation_confidence:
      response
        ? response.propagation_confidence
        : null,

    followup_required:
      response
        ? response.followup_required
        : false,

    adaptive_recommended_action:
      adaptiveAction(
        adaptivePriorityScore,
        responseClass
      ),

    updated_at:
      new Date().toISOString()
  };

});

adaptiveTargets.sort(
  (a,b) =>
    (b.adaptive_priority_score || 0) -
    (a.adaptive_priority_score || 0)
);

const payload = {

  version: "black_dragon_books_adaptive_priority_index_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: adaptiveTargets.length,

    critical:
      adaptiveTargets.filter(t => t.adaptive_priority_tier === "CRITICAL").length,

    high:
      adaptiveTargets.filter(t => t.adaptive_priority_tier === "HIGH").length,

    medium:
      adaptiveTargets.filter(t => t.adaptive_priority_tier === "MEDIUM").length,

    low:
      adaptiveTargets.filter(t => t.adaptive_priority_tier === "LOW").length,

    none:
      adaptiveTargets.filter(t => t.adaptive_priority_tier === "NONE").length,

    with_feedback:
      adaptiveTargets.filter(t => t.response_classification).length
  },

  top_operational_targets:
    adaptiveTargets.slice(0, 25),

  targets:
    adaptiveTargets
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status: "ADAPTIVE_PRIORITY_RECALCULATION_COMPLETE",
  totals: payload.totals,
  output: outputPath
}, null, 2));
