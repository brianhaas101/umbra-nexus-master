const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const laReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const sdReview = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

const lbDead = read(
  "public/data/clients/black_dragon/automation/live_validation/dead_routes/dead_route_review_queue.json"
);

const laDead = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/dead_routes/dead_route_review_queue.json"
);

const sdDead = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/dead_routes/dead_route_review_queue.json"
);

const manualReviewItems = [
  ...laReview.contact_review.map(row => ({ ...row, city: "Los Angeles" })),
  ...sdReview.contact_review.map(row => ({ ...row, city: "San Diego" }))
].filter(row => row.contact_ready_candidate === true);

const routeReviewItems = [
  ...(lbDead.dead_route_items || []).map(row => ({ ...row, city: "Long Beach" })),
  ...(laDead.dead_route_items || []).map(row => ({ ...row, city: "Los Angeles" })),
  ...(sdDead.dead_route_items || []).map(row => ({ ...row, city: "San Diego" }))
];

const queues = {
  version: "black_dragon_client_review_queues_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  client_visible: true,

  queues: {
    manual_contact_review: {
      queue_id: "BD_CLIENT_MANUAL_CONTACT_REVIEW",
      item_count: manualReviewItems.length,
      items:
        manualReviewItems.map((item, index) => ({
          review_item_id:
            `BD_CLIENT_CONTACT_REVIEW_${String(index + 1).padStart(5, "0")}`,
          city: item.city,
          organization_name: item.organization_name,
          city_rank: item.city_rank,
          route_validation_status: item.route_validation_status,
          public_contact_url: item.public_contact_url,
          manual_contact_possible_after_review:
            item.manual_contact_possible_after_review === true,
          automated_outreach_allowed: false,
          contact_ready_promotion_allowed: false
        }))
    },

    route_issue_review: {
      queue_id: "BD_CLIENT_ROUTE_ISSUE_REVIEW",
      item_count: routeReviewItems.length,
      items:
        routeReviewItems.map((item, index) => ({
          route_review_id:
            `BD_CLIENT_ROUTE_REVIEW_${String(index + 1).padStart(5, "0")}`,
          city: item.city,
          organization_name: item.organization_name,
          url: item.url,
          failure_status: item.failure_status,
          founder_review_required: item.founder_review_required !== false,
          automatic_delete_allowed: false,
          automated_outreach_allowed: false
        }))
    }
  },

  safety_locks: {
    review_queue_can_display: true,
    review_queue_can_auto_contact: false,
    review_queue_can_auto_promote: false,
    review_queue_can_delete: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/client_access/black_dragon/review_queues/client_review_queues.json"
);

fs.writeFileSync(out, JSON.stringify(queues, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BLACK_DRAGON_CLIENT_REVIEW_QUEUES_COMPLETE",
  manual_contact_review_items: queues.queues.manual_contact_review.item_count,
  route_issue_review_items: queues.queues.route_issue_review.item_count,
  output: out
}, null, 2));
