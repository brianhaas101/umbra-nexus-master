const fs = require("fs");
const path = require("path");

const targetsPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const messagesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json"
);

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

const messageByEntity = new Map(messages.map(m => [m.entity_id, m]));

const snapshot = targets.map(t => {
  const message = messageByEntity.get(t.entity_id);

  return {
    entity_id: t.entity_id,
    organization_name: t.organization_name,
    target_name: t.target_name || "UNKNOWN_LEADER",
    leader_role: t.leader_role || "UNKNOWN",

    lead_temperature: t.lead_temperature || "REVIEW",
    propagation_score: t.propagation_score || 0,
    target_classification: t.target_classification || "UNSCORED",

    message_id: message ? message.message_id : null,
    template_key: message ? message.template_key : null,

    outreach_status: t.outreach_status || "NOT_CONTACTED",

    contacted_at: null,
    responded_at: null,
    endorsed_at: null,
    closed_at: null,

    books_ordered: 0,
    estimated_member_orders: 0,
    estimated_revenue: 0,

    endorsement_type: null,
    followup_required: false,
    next_action: "GENERATE_AND_SEND_OUTREACH",

    tracking_notes: null,

    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "BOOK_OUTREACH_TRACKING_SNAPSHOT_CREATED",
  targets: targets.length,
  tracked_entities: snapshot.length,
  output: outputPath
}, null, 2));
