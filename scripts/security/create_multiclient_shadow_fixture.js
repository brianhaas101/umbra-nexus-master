const fs = require("fs");
const path = require("path");

const root = path.resolve(
  "public/data/clients/test_client_shadow"
);

const dirs = [
  root,
  path.join(root, "books"),
  path.join(root, "books/queue"),
  path.join(root, "books/responses"),
  path.join(root, "books/adaptive_priority")
];

for (const d of dirs) {
  fs.mkdirSync(d, { recursive: true });
}

fs.writeFileSync(
  path.join(root, "books/queue/outreach_ready_queue.v1.json"),
  JSON.stringify({
    version: "test_client_shadow_queue_v1",
    client_id: "test_client_shadow",
    all_queue_items: [
      {
        entity_id: "SHADOW_TEST_ENTITY_001",
        organization_name: "SHADOW SHOULD NOT BE VISIBLE",
        queue_status: "READY"
      }
    ]
  }, null, 2)
);

fs.writeFileSync(
  path.join(root, "books/responses/classified_responses.v1.json"),
  JSON.stringify({
    version: "test_client_shadow_responses_v1",
    client_id: "test_client_shadow",
    responses: [
      {
        response_id: "SHADOW_RESPONSE_001",
        entity_id: "SHADOW_TEST_ENTITY_001",
        response_status: "RESPONDED"
      }
    ]
  }, null, 2)
);

fs.writeFileSync(
  path.join(root, "books/adaptive_priority/adaptive_priority_index.v1.json"),
  JSON.stringify({
    version: "test_client_shadow_adaptive_priority_v1",
    client_id: "test_client_shadow",
    targets: [
      {
        entity_id: "SHADOW_TEST_ENTITY_001",
        adaptive_priority_score: 100
      }
    ]
  }, null, 2)
);

console.log(JSON.stringify({
  status: "SHADOW_CLIENT_FIXTURE_CREATED",
  client_id: "test_client_shadow",
  root
}, null, 2));
