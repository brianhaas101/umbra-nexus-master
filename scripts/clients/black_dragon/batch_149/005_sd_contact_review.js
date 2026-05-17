const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json"
);

const byOrg = new Map(
  results.validation_results.map(r => [r.organization_name, r])
);

const review = runtime.merged_entities.map(entity => {

  const result = byOrg.get(entity.organization_name);

  const valid =
    result &&
    result.fetch_status === "VALID";

  return {
    city_runtime_entity_id:
      entity.city_runtime_entity_id,

    organization_name:
      entity.organization_name,

    city_rank:
      entity.city_rank,

    route_validation_status:
      result
        ? result.fetch_status
        : "NO_ROUTE_TESTED",

    public_contact_url:
      result
        ? result.url
        : null,

    contact_ready_candidate:
      valid,

    manual_contact_possible_after_review:
      valid,

    contact_ready_promotion_allowed:
      false,

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const payload = {
  version:
    "black_dragon_san_diego_contact_route_review_v1",

  generated_at:
    new Date().toISOString(),

  review_count:
    review.length,

  contact_ready_candidates:
    review.filter(r => r.contact_ready_candidate).length,

  contact_review:
    review
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_CONTACT_ROUTE_REVIEW_COMPLETE",
  review_count: payload.review_count,
  contact_ready_candidates: payload.contact_ready_candidates,
  output: out
}, null, 2));
