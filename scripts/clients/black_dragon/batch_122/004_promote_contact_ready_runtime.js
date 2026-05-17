const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const mergedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"
);

const queue = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/contact_resolution/long_beach/review_queue/long_beach_client_action_queue.json"),
  "utf8"
));

const merged = JSON.parse(fs.readFileSync(mergedPath, "utf8"));

const contactMap = new Map();

for (const q of queue.queue) {
  contactMap.set(
    q.organization_name.toLowerCase().trim(),
    q
  );
}

merged.merged_entities = merged.merged_entities.map(entity => {

  const hit = contactMap.get(
    entity.organization_name.toLowerCase().trim()
  );

  if (!hit) return entity;

  return {
    ...entity,

    contact_ready:
      true,

    client_action_available:
      true,

    public_contact_url:
      hit.public_contact_url,

    contact_route_type:
      hit.contact_route_type,

    outreach_execution_status:
      "CLIENT_MANUAL_ONLY",

    automated_outreach_allowed:
      false
  };
});

fs.writeFileSync(
  mergedPath,
  JSON.stringify(merged, null, 2)
);

console.log(JSON.stringify({
  status: "LONG_BEACH_RUNTIME_CONTACT_PROMOTION_COMPLETE",
  promoted_contact_ready: queue.total_client_action_routes,
  output: mergedPath
}, null, 2));
