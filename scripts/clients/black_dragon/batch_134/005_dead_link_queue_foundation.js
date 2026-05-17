const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queue = {
  version: "black_dragon_dead_link_suppression_queue_v1",
  generated_at: new Date().toISOString(),

  queue_status: "READY",

  dead_link_items: [],

  dead_link_schema: {
    dead_link_id: "string",
    source_name: "string",
    source_url: "string",
    detected_at: "ISO_TIMESTAMP",
    failure_type: "HTTP_404_DNS_TIMEOUT_ROBOTS_BLOCKED_OTHER",
    previous_runtime_status: "string",
    suppression_action: "QUEUE_REVALIDATION_DECAY_SCORE_DISABLE_CONTACT_READY",
    runtime_mutation_performed: "boolean",
    founder_review_required: "boolean"
  },

  suppression_laws: {
    dead_link_can_decay_score: true,
    dead_link_can_disable_contact_ready_after_revalidation_failure: true,
    dead_link_cannot_delete_entity_without_quarantine: true,
    dead_link_cannot_auto_contact: true,
    dead_link_cannot_auto_promote: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/fetch/dead_links/dead_link_suppression_queue.json"
);

fs.writeFileSync(out, JSON.stringify(queue, null, 2), "utf8");

console.log(JSON.stringify({
  status: "DEAD_LINK_SUPPRESSION_QUEUE_COMPLETE",
  queue_status: queue.queue_status,
  output: out
}, null, 2));
