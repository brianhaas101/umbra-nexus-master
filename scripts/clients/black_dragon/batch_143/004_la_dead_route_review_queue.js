const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
);

const reviewItems = results.validation_results
  .filter(row => row.fetch_status !== "VALID")
  .map((row, index) => ({
    dead_route_id: `BD_LA_ROUTE_REVIEW_${String(index + 1).padStart(5, "0")}`,
    validation_id: row.validation_id,
    organization_name: row.organization_name,
    route_type: row.route_type,
    url: row.url,
    failure_status: row.fetch_status,
    error: row.error || null,
    queued_at: row.checked_at,
    safe_get_fallback_allowed:
      row.fetch_status === "SAFE_GET_REVIEW_REQUIRED",
    founder_review_required: true,
    runtime_decay_allowed: true,
    automatic_delete_allowed: false,
    automated_outreach_allowed: false
  }));

const queue = {
  version: "black_dragon_los_angeles_dead_route_review_queue_v1",
  generated_at: new Date().toISOString(),
  city: "Los Angeles",
  state: "CA",
  review_item_count: reviewItems.length,
  dead_route_items: reviewItems,
  suppression_laws: {
    review_before_decay: true,
    no_automatic_delete: true,
    no_auto_contact: true,
    no_auto_promotion: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/dead_routes/dead_route_review_queue.json"
);

fs.writeFileSync(out, JSON.stringify(queue, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_DEAD_ROUTE_REVIEW_QUEUE_COMPLETE",
  review_item_count: queue.review_item_count,
  output: out
}, null, 2));
