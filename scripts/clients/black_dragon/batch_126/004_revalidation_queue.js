const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtime = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
  "utf8"
));

const queue = runtime.merged_entities
  .filter(e => e.contact_ready)
  .map((e, index) => ({
    revalidation_task_id: `BD_LB_REVALIDATE_${String(index + 1).padStart(5, "0")}`,
    city_runtime_entity_id: e.city_runtime_entity_id,
    organization_name: e.organization_name,
    current_contact_url: e.public_contact_url,
    contact_route_type: e.contact_route_type,
    revalidation_reason: "CONTACT_READY_ROUTE_WEEKLY_RECHECK",
    task_status: "PENDING_REVALIDATION",
    disable_contact_ready_on_failure: true,
    automated_outreach_allowed: false
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_contact_route_revalidation_queue_v1",
  generated_at: new Date().toISOString(),
  total_revalidation_tasks: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_REVALIDATION_QUEUE_COMPLETE",
  total_revalidation_tasks: queue.length,
  output: out
}, null, 2));
