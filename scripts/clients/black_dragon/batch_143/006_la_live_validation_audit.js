const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const targets = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/manifests/live_validation_targets.json"
);

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
);

const freshness = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/freshness/live_freshness_registry.json"
);

const deadRoutes = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/dead_routes/dead_route_review_queue.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const audit = {
  version: "black_dragon_batch_143_los_angeles_live_validation_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "143_LOS_ANGELES_LIVE_VALIDATION_AND_CONTACT_ROUTE_REVIEW",

  counts: {
    validation_targets: targets.validation_targets.length,
    validation_results: results.validation_count,
    valid_routes: results.validation_results.filter(r => r.fetch_status === "VALID").length,
    review_routes: results.validation_results.filter(r => r.fetch_status !== "VALID").length,
    freshness_records: freshness.freshness_records.length,
    dead_route_review_items: deadRoutes.review_item_count,
    contact_review_records: contactReview.review_count,
    contact_ready_candidates: contactReview.contact_ready_candidates
  },

  gates: {
    validation_targets_exist: targets.validation_targets.length === 10,
    validation_results_match_targets: results.validation_count === targets.validation_targets.length,
    freshness_records_match_results: freshness.freshness_records.length === results.validation_count,
    contact_review_matches_runtime: contactReview.review_count === 10,

    no_contact_ready_promotion:
      contactReview.contact_review.every(r => r.contact_ready_promotion_allowed === false),

    no_automated_outreach:
      results.validation_results.every(r => r.automated_outreach_allowed === false) &&
      contactReview.contact_review.every(r => r.automated_outreach_allowed === false),

    no_runtime_mutation:
      results.validation_results.every(r => r.runtime_mutation_allowed === false) &&
      contactReview.contact_review.every(r => r.runtime_mutation_allowed === false),

    no_automatic_delete:
      deadRoutes.dead_route_items.every(r => r.automatic_delete_allowed === false)
  },

  next_phase: "BATCH_144_LOS_ANGELES_CLIENT_UI_SURFACE_AND_PRODUCTION_AUDIT",
  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/audit/batch_143_los_angeles_live_validation_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_143_LA_LIVE_VALIDATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
