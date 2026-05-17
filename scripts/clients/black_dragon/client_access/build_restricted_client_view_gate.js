const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const founderReview = readJson(
  "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.v1.json"
);

const overlay = readJson(
  "public/data/clients/black_dragon/contact_ready_runtime/overlay/contact_ready_runtime_overlay.v1.json"
);

const founderRows = founderReview.founder_review_rows || [];
const overlayNodes = overlay.overlay_nodes || [];

const safeClientRows = founderRows.map(x => ({
  entity_id: x.entity_id,
  organization_name: x.organization_name,
  organization_type: x.organization_type,
  city: x.city,
  region: x.region,
  authentication_status: x.authentication_status,
  source_discovery_status: x.source_discovery_status,
  public_source_present: x.public_source_present,
  visual_review_status: x.visual_review_status,
  reviewer_decision: x.reviewer_decision,
  contact_ready: false,
  outreach_allowed: false,
  contact_details_visible: false,
  source_url_visible: false,
  client_safe_status: "VISIBLE_SAFE_NON_CONTACT_MODE"
}));

const clientView = {
  version: "black_dragon_restricted_client_view_gate_v1_batch_100A",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  client_access_enabled: true,
  outreach_enabled: false,
  contact_layer_enabled: false,
  founder_override_required: true,
  policy: "CLIENT_CAN_VIEW_SAFE_INTELLIGENCE_GRAPH_ONLY",
  totals: {
    safe_visible_entities: safeClientRows.length,
    contact_ready_targets: overlayNodes.length,
    outreach_enabled_targets: overlayNodes.filter(x => x.outreach_allowed === true).length
  },
  visible_client_entities: safeClientRows,
  blocked_layers: [
    "UNVERIFIED_CONTACTS",
    "UNVERIFIED_OUTREACH",
    "FOUNDER_ONLY_REVIEW_DATA",
    "RAW_CONTACT_IMPORTS",
    "UNAPPROVED_PROMOTION_CANDIDATES"
  ]
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/client_access/view_gate/restricted_client_view_gate.v1.json"),
  JSON.stringify(clientView, null, 2)
);

console.log(JSON.stringify({
  status: "RESTRICTED_CLIENT_VIEW_GATE_REPAIRED_AND_CREATED",
  totals: clientView.totals,
  access: {
    client_access_enabled: clientView.client_access_enabled,
    outreach_enabled: clientView.outreach_enabled,
    contact_layer_enabled: clientView.contact_layer_enabled
  }
}, null, 2));
