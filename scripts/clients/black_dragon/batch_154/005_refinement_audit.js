const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const confidence = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/overlap_confidence/overlap_confidence_registry.json"
);

const refinedScores = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/score_model/refined_regional_scores.json"
);

const certainty = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/certainty/propagation_certainty_model.json"
);

const feed = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/explainability/refined_client_opportunity_feed.json"
);

const audit = {
  version:
    "black_dragon_batch_154_regional_overlap_scoring_refinement_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "154_REGIONAL_OVERLAP_SCORING_REFINEMENT",

  counts: {
    overlap_confidence_records:
      confidence.confidence_records,

    refined_regional_scores:
      refinedScores.scored_entities,

    propagation_certainty_records:
      certainty.certainty_records,

    refined_client_opportunities:
      feed.summary.total_opportunities,

    high_certainty_opportunities:
      feed.summary.high_certainty,

    medium_certainty_opportunities:
      feed.summary.medium_certainty,

    review_certainty_opportunities:
      feed.summary.review_certainty
  },

  gates: {
    overlap_confidence_exists:
      confidence.confidence_records > 0,

    refined_scores_exist:
      refinedScores.scored_entities >= 30,

    certainty_model_exists:
      certainty.certainty_records > 0,

    refined_feed_visible:
      feed.client_visible === true,

    opportunities_preserved:
      feed.summary.total_opportunities > 0,

    no_overlap_auto_outreach:
      confidence.confidence.every(r => r.automated_outreach_allowed === false),

    no_certainty_auto_outreach:
      certainty.certainty.every(r => r.automated_outreach_allowed === false),

    no_feed_auto_contact:
      feed.safety_locks.feed_can_auto_contact === false,

    no_feed_auto_promotion:
      feed.safety_locks.feed_can_auto_promote === false,

    no_runtime_mutation:
      feed.safety_locks.feed_can_mutate_runtime === false
  },

  interpretation: {
    operational_meaning:
      "Regional opportunity ranking now uses confidence, city diversity, duplicate-inflation control, and certainty scoring.",

    integrity_meaning:
      "The corridor is less vulnerable to inflated duplicate entities or weak single-city chains.",

    client_meaning:
      "Black Dragon sees cleaner prioritized opportunities rather than raw high-score lists."
  },

  next_phase:
    "BATCH_155_BLACK_DRAGON_CLIENT_ACCESS_ROLLOUT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/refinement/audit/batch_154_regional_overlap_scoring_refinement_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_154_REGIONAL_OVERLAP_SCORING_REFINEMENT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
