const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const quarantine = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/pipeline/quarantine/quarantined_import_rows.json"),
  "utf8"
));

const reviewQueue = quarantine.quarantined.map((row, index) => ({
  review_id: `BD_FOUNDER_REVIEW_${String(index + 1).padStart(4, "0")}`,
  execution_id: row.execution_id,
  import_row_id: row.import_row_id,
  discovery_task_id: row.discovery_task_id,
  organization_seed: row.organization_seed,
  source_type: row.source_type,
  source_url: row.source_url,
  contact_route: row.contact_route,
  contact_person_or_role: row.contact_person_or_role,
  review_status: "PENDING_FOUNDER_REVIEW",
  required_action: "VERIFY_REAL_PUBLIC_SOURCE_AND_CONTACT_ROUTE",
  quarantine_reasons: row.quarantine_reasons,
  founder_can_promote: false,
  outreach_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/review_queue/founder_review_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_founder_review_queue_builder_v1",
  generated_at: new Date().toISOString(),
  total_review_items: reviewQueue.length,
  reviewQueue
}, null, 2));

console.log(JSON.stringify({
  status: "FOUNDER_REVIEW_QUEUE_BUILDER_COMPLETE",
  total_review_items: reviewQueue.length,
  output: out
}, null, 2));
