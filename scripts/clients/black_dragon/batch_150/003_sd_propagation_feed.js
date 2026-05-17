const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"
);

const review = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

const reviewMap = new Map(
  review.contact_review.map(r => [r.organization_name, r])
);

const feed = {
  version:
    "black_dragon_san_diego_propagation_feed_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "San Diego",

  state:
    "CA",

  client_visible:
    true,

  feed_summary: {
    total_paths:
      paths.total_paths,

    manual_contact_candidate_paths:
      paths.paths.filter(path => {
        const reviewRow = reviewMap.get(path.root_organization);
        return reviewRow && reviewRow.contact_ready_candidate;
      }).length
  },

  propagation_paths:
    paths.paths.map(pathRow => {

      const reviewRow =
        reviewMap.get(pathRow.root_organization) || {};

      return {
        propagation_path_id:
          pathRow.propagation_path_id,

        root_organization:
          pathRow.root_organization,

        root_influence_score:
          pathRow.root_influence_score,

        route_validation_status:
          reviewRow.route_validation_status || "NO_ROUTE_TESTED",

        contact_ready_candidate:
          reviewRow.contact_ready_candidate === true,

        recommended_action:
          reviewRow.contact_ready_candidate === true
            ? "MANUAL_REVIEW_THEN_ACTION"
            : "ROUTE_REVIEW_REQUIRED",

        connected_target_count:
          pathRow.connected_target_count,

        automated_outreach_allowed:
          false,

        runtime_mutation_allowed:
          false
      };
    })
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/propagation_feed/san_diego_client_propagation_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_PROPAGATION_FEED_COMPLETE",
  total_paths: feed.feed_summary.total_paths,
  output: out
}, null, 2));
