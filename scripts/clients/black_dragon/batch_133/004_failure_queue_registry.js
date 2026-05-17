const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const failures = {
  version: "black_dragon_production_failure_queue_v1",
  generated_at: new Date().toISOString(),

  queue_status: "READY",

  failure_items: [],

  failure_schema: {
    failure_id: "string",
    job_id: "string",
    runner: "string",
    city: "string",
    state: "string",
    failure_type: "string",
    failure_message: "string",
    occurred_at: "ISO_TIMESTAMP",
    retry_count: "number",
    founder_review_required: "boolean",
    runtime_mutation_performed: "boolean"
  },

  hardlocks: {
    failed_jobs_cannot_auto_mutate_runtime: true,
    failed_jobs_cannot_auto_contact: true,
    failed_jobs_require_review_after_max_retries: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/failures/failure_queue.json"
);

fs.writeFileSync(out, JSON.stringify(failures, null, 2), "utf8");

console.log(JSON.stringify({
  status: "FAILURE_QUEUE_REGISTRY_COMPLETE",
  queue_status: failures.queue_status,
  output: out
}, null, 2));
