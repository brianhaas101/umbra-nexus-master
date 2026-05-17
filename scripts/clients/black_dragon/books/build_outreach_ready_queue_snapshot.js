const fs = require("fs");
const path = require("path");

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/queue/snapshots/outreach_ready_queue_snapshot.v1.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const snapshot = {
  version: "black_dragon_books_outreach_ready_queue_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: queue.totals,

  next_10_actions:
    queue.all_queue_items
      .slice(0, 10)
      .map(q => ({
        organization_name: q.organization_name,
        leader_role: q.leader_role,
        queue_status: q.queue_status,
        priority_score: q.unified_priority_score,
        priority_tier: q.unified_priority_tier,
        recommended_action: q.recommended_action,
        contact_route_type: q.best_contact_route ? q.best_contact_route.contact_type : null,
        message_subject: q.message_subject
      }))
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "OUTREACH_READY_QUEUE_SNAPSHOT_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
