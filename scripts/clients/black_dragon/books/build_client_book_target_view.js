const fs = require("fs");
const path = require("path");

const targetsPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const trackingPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json"
);

const messagesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const tracking = JSON.parse(fs.readFileSync(trackingPath, "utf8"));
const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

const trackingMap = new Map(
  tracking.map(t => [t.entity_id, t])
);

const messageMap = new Map(
  messages.map(m => [m.entity_id, m])
);

const clientView = targets.map(t => {

  const track = trackingMap.get(t.entity_id);
  const msg = messageMap.get(t.entity_id);

  return {

    entity_id: t.entity_id,

    organization_name:
      t.organization_name || "UNKNOWN_ORG",

    target_name:
      t.target_name || "UNKNOWN_LEADER",

    leader_role:
      t.leader_role || "UNKNOWN",

    organization_type:
      t.organization_type || "UNKNOWN",

    country:
      t.country || "UNKNOWN",

    region:
      t.region || null,

    lead_temperature:
      t.lead_temperature || "REVIEW",

    propagation_score:
      t.propagation_score || 0,

    target_classification:
      t.target_classification || "UNSCORED",

    endorsement_likelihood:
      t.endorsement_likelihood || 0,

    bulk_order_potential:
      t.bulk_order_potential || 0,

    member_purchase_multiplier:
      t.member_purchase_multiplier || 0,

    why_target:
      Array.isArray(t.why_target)
        ? t.why_target
        : [],

    outreach_status:
      track
        ? track.outreach_status
        : "NOT_CONTACTED",

    next_action:
      track
        ? track.next_action
        : "REVIEW_REQUIRED",

    followup_required:
      track
        ? track.followup_required
        : false,

    estimated_revenue:
      track
        ? track.estimated_revenue
        : 0,

    books_ordered:
      track
        ? track.books_ordered
        : 0,

    estimated_member_orders:
      track
        ? track.estimated_member_orders
        : 0,

    recommended_template:
      msg
        ? msg.template_key
        : null,

    message_subject:
      msg
        ? msg.subject
        : null,

    client_ready:
      true,

    generated_at:
      new Date().toISOString()
  };
});

clientView.sort(
  (a,b) =>
    (b.propagation_score || 0) -
    (a.propagation_score || 0)
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(clientView, null, 2)
);

console.log(JSON.stringify({
  status: "CLIENT_BOOK_TARGET_VIEW_BUILD_COMPLETE",
  total_targets: clientView.length,
  output: outputPath
}, null, 2));
