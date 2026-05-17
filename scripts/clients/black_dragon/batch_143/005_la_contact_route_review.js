const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
);

const byOrg = new Map(
  results.validation_results.map(row => [row.organization_name, row])
);

const contactReview = runtime.merged_entities.map(entity => {
  const result = byOrg.get(entity.organization_name) || null;
  const validRoute = result && result.fetch_status === "VALID";

  return {
    city_runtime_entity_id: entity.city_runtime_entity_id,
    organization_name: entity.organization_name,
    city_rank: entity.city_rank,
    priority_tier: entity.priority_tier,
    best_score: entity.best_score,
    route_validation_status: result ? result.fetch_status : "NO_ROUTE_TESTED",
    public_contact_url: result ? result.url : null,
    contact_ready_candidate: validRoute,
    contact_ready_promotion_allowed: false,
    manual_review_required: true,
    manual_contact_possible_after_review: validRoute,
    automated_outreach_allowed: false,
    runtime_mutation_allowed: false
  };
});

const payload = {
  version: "black_dragon_los_angeles_contact_route_review_v1",
  generated_at: new Date().toISOString(),
  city: "Los Angeles",
  state: "CA",
  review_count: contactReview.length,
  contact_ready_candidates: contactReview.filter(r => r.contact_ready_candidate).length,
  contact_review: contactReview
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_CONTACT_ROUTE_REVIEW_COMPLETE",
  review_count: payload.review_count,
  contact_ready_candidates: payload.contact_ready_candidates,
  output: out
}, null, 2));
