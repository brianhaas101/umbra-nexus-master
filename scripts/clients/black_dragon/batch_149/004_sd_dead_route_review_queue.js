const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json"
);

const reviewItems =
  results.validation_results
    .filter(r => r.fetch_status !== "VALID")
    .map((row, index) => ({
      dead_route_id:
        `BD_SD_ROUTE_REVIEW_${String(index + 1).padStart(5, "0")}`,

      validation_id:
        row.validation_id,

      organization_name:
        row.organization_name,

      route_type:
        row.route_type,

      url:
        row.url,

      failure_status:
        row.fetch_status,

      founder_review_required:
        true,

      automatic_delete_allowed:
        false,

      automated_outreach_allowed:
        false
    }));

const payload = {
  version:
    "black_dragon_san_diego_dead_route_review_queue_v1",

  generated_at:
    new Date().toISOString(),

  review_item_count:
    reviewItems.length,

  dead_route_items:
    reviewItems
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/san_diego/dead_routes/dead_route_review_queue.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_DEAD_ROUTE_QUEUE_COMPLETE",
  review_item_count: payload.review_item_count,
  output: out
}, null, 2));
