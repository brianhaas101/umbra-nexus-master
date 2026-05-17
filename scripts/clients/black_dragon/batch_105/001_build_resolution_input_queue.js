const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const reviewPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/review_queue/founder_review_queue.json"
);

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

const queue = review.reviewQueue.map((row, index) => ({
  resolution_id: `BD_SOURCE_RESOLUTION_${String(index + 1).padStart(4, "0")}`,
  review_id: row.review_id,
  execution_id: row.execution_id,
  import_row_id: row.import_row_id,
  discovery_task_id: row.discovery_task_id,
  organization_seed: row.organization_seed,
  source_type: row.source_type,
  existing_source_url: row.source_url,
  existing_contact_route: row.contact_route,
  resolution_status: "PENDING_REAL_SOURCE_RESOLUTION",
  founder_review_required: true,
  outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/source_resolution_input_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_source_resolution_input_queue_v1",
  generated_at: new Date().toISOString(),
  source_batch: "104_REAL_SOURCE_IMPORT_EXECUTION_PIPELINE",
  total_resolution_inputs: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "SOURCE_RESOLUTION_INPUT_QUEUE_COMPLETE",
  total_resolution_inputs: queue.length,
  output: out
}, null, 2));
