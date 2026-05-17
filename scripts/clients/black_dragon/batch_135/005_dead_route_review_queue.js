const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/results/live_http_validation_results.json"
);

const deadRoutes =
  results.validation_results.filter(r =>
    r.fetch_status !== "VALID"
  );

const queue = {
  version:
    "black_dragon_dead_route_review_queue_v1",

  generated_at:
    new Date().toISOString(),

  dead_route_items:
    deadRoutes.map((r, idx) => ({
      dead_route_id:
        `BD_DEAD_ROUTE_${String(idx + 1).padStart(4, "0")}`,

      organization_name:
        r.organization_name,

      url:
        r.url,

      failure_status:
        r.fetch_status,

      queued_at:
        r.checked_at,

      runtime_decay_allowed:
        true,

      automatic_delete_allowed:
        false,

      founder_review_required:
        true
    })),

  suppression_rules: {
    dead_route_decay_enabled: true,
    automatic_delete_disabled: true,
    quarantine_required_before_disable: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/dead_routes/dead_route_review_queue.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(queue, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "DEAD_ROUTE_REVIEW_QUEUE_COMPLETE",

  dead_routes:
    queue.dead_route_items.length,

  output:
    out
}, null, 2));
