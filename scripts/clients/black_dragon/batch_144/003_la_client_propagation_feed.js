const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const reviewByOrg = new Map(
  contactReview.contact_review.map(row => [row.organization_name, row])
);

const feed = {
  version: "black_dragon_los_angeles_client_propagation_feed_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  city: "Los Angeles",
  state: "CA",

  feed_id: "BD_LA_CLIENT_PROPAGATION_FEED",
  feed_title: "Los Angeles Propagation Opportunities",
  client_visible: true,

  feed_summary: {
    total_paths: paths.total_paths,
    manual_contact_candidate_paths:
      paths.paths.filter(p => {
        const review = reviewByOrg.get(p.root_organization);
        return review && review.contact_ready_candidate === true;
      }).length,
    review_required_paths:
      paths.paths.filter(p => {
        const review = reviewByOrg.get(p.root_organization);
        return !review || review.contact_ready_candidate !== true;
      }).length
  },

  propagation_opportunities:
    paths.paths.map(pathway => {
      const review = reviewByOrg.get(pathway.root_organization) || {};

      return {
        propagation_path_id: pathway.propagation_path_id,
        root_organization: pathway.root_organization,
        root_influence_score: pathway.root_influence_score,
        route_validation_status: review.route_validation_status || "NO_ROUTE_TESTED",
        contact_ready_candidate: review.contact_ready_candidate === true,
        recommended_use:
          review.contact_ready_candidate === true
            ? "MANUAL_REVIEW_THEN_ACTION"
            : "ROUTE_REVIEW_BEFORE_ACTION",

        connected_target_count: pathway.connected_targets.length,
        top_connected_targets: pathway.connected_targets.slice(0, 5),

        client_action_label:
          review.contact_ready_candidate === true
            ? "Manual contact may be possible after final human review."
            : "Resolve route review before manual contact.",

        automated_outreach_allowed: false,
        runtime_mutation_allowed: false,
        contact_ready_promotion_allowed: false
      };
    }),

  safety_locks: {
    feed_can_recommend: true,
    feed_can_auto_contact: false,
    feed_can_auto_promote: false,
    feed_can_delete_targets: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/propagation_feed/los_angeles_client_propagation_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_CLIENT_PROPAGATION_FEED_COMPLETE",
  total_paths: feed.feed_summary.total_paths,
  manual_contact_candidate_paths: feed.feed_summary.manual_contact_candidate_paths,
  review_required_paths: feed.feed_summary.review_required_paths,
  output: out
}, null, 2));
