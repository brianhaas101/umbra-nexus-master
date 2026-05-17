const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/contact_resolution/long_beach/validated/long_beach_contact_routes_validated.json"),
  "utf8"
));

const queue = validated.validated.map((r, index) => ({
  client_review_queue_id:
    `BD_LB_CLIENT_QUEUE_${String(index + 1).padStart(5, "0")}`,

  organization_name:
    r.organization_name,

  public_contact_url:
    r.public_contact_url,

  contact_route_type:
    r.contact_route_type,

  route_status:
    r.route_status,

  client_action_available:
    true,

  contact_ready:
    true,

  outreach_executed:
    false,

  automated_outreach_allowed:
    false,

  manual_client_control_required:
    true
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/long_beach/review_queue/long_beach_client_action_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_client_action_queue_v1",
  generated_at: new Date().toISOString(),
  total_client_action_routes: queue.length,
  queue
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CLIENT_ACTION_QUEUE_COMPLETE",
  total_client_action_routes: queue.length,
  output: out
}, null, 2));
