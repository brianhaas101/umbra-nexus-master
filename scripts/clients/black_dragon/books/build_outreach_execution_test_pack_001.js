const fs = require("fs");
const path = require("path");

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/execution/test_pack_001/outreach_execution_test_pack_001.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const ready = (queue.ready_queue || [])
  .filter(q =>
    q.queue_status === "READY" &&
    q.message_body &&
    q.best_contact_route
  )
  .sort((a,b) =>
    (b.unified_priority_score || 0) -
    (a.unified_priority_score || 0)
  )
  .slice(0, 15);

const testPack = {
  version: "black_dragon_books_outreach_execution_test_pack_001_v1",
  generated_at: new Date().toISOString(),

  execution_rules: {
    automated_sending_allowed: false,
    manual_send_only: true,
    public_contact_routes_only: true,
    no_private_group_contact: true,
    no_fabricated_contacts: true,
    max_first_batch: 15
  },

  totals: {
    selected_targets: ready.length
  },

  targets: ready.map((q, index) => ({
    test_rank: index + 1,
    queue_id: q.queue_id,
    entity_id: q.entity_id,

    organization_name: q.organization_name,
    target_name: q.target_name,
    leader_role: q.leader_role,
    organization_type: q.organization_type,

    priority_score: q.unified_priority_score,
    priority_tier: q.unified_priority_tier,
    propagation_score: q.propagation_score,
    contactability_score: q.contactability_score,

    contact_route: q.best_contact_route,

    message_subject: q.message_subject,
    message_body: q.message_body,
    template_key: q.template_key,

    execution_status: "READY_TO_SEND_MANUALLY",

    result_status: "PENDING",

    sent_at: null,
    response_at: null,
    notes: null
  }))
};

fs.writeFileSync(outputPath, JSON.stringify(testPack, null, 2));

console.log(JSON.stringify({
  status: "OUTREACH_EXECUTION_TEST_PACK_CREATED",
  selected_targets: testPack.totals.selected_targets,
  output: outputPath
}, null, 2));
