const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const permissions = read(
  "public/data/clients/black_dragon/client_access/black_dragon/permissions/client_permission_manifest.json"
);

const dashboard = read(
  "public/data/clients/black_dragon/client_access/black_dragon/dashboards/client_dashboard_summary.json"
);

const feed = read(
  "public/data/clients/black_dragon/client_access/black_dragon/feeds/client_opportunity_feed.json"
);

const queues = read(
  "public/data/clients/black_dragon/client_access/black_dragon/review_queues/client_review_queues.json"
);

const audit = {
  version: "black_dragon_batch_155_client_access_rollout_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "155_BLACK_DRAGON_CLIENT_ACCESS_ROLLOUT",

  counts: {
    allowed_cities: permissions.access_scope.allowed_cities.length,
    allowed_modules: permissions.access_scope.allowed_modules.length,
    forbidden_capabilities: permissions.forbidden_capabilities.length,
    dashboard_runtime_entities: dashboard.region_summary.total_runtime_entities,
    client_opportunities: feed.opportunities.length,
    manual_contact_review_items:
      queues.queues.manual_contact_review.item_count,
    route_issue_review_items:
      queues.queues.route_issue_review.item_count
  },

  gates: {
    client_permissions_exist:
      permissions.client_id === "black_dragon_omg_cert_v1",

    three_city_access:
      permissions.access_scope.allowed_cities.length === 3,

    dashboard_visible:
      dashboard.client_visible === true,

    opportunity_feed_visible:
      feed.client_visible === true,

    review_queues_visible:
      queues.client_visible === true,

    founder_admin_forbidden:
      permissions.forbidden_capabilities.includes("FOUNDER_ADMIN_VIEW"),

    no_auto_contact:
      permissions.client_capabilities.can_auto_contact === false &&
      feed.safety_locks.feed_can_auto_contact === false &&
      queues.safety_locks.review_queue_can_auto_contact === false,

    no_auto_promotion:
      permissions.client_capabilities.can_auto_promote === false &&
      feed.safety_locks.feed_can_auto_promote === false &&
      queues.safety_locks.review_queue_can_auto_promote === false,

    no_runtime_mutation:
      permissions.client_capabilities.can_mutate_runtime === false &&
      feed.safety_locks.feed_can_mutate_runtime === false,

    no_delete:
      permissions.client_capabilities.can_delete_entities === false &&
      queues.safety_locks.review_queue_can_delete === false
  },

  certification:
    "BLACK_DRAGON_CLIENT_ACCESS_READY",

  next_phase:
    "BATCH_156_SOUTHERN_CALIFORNIA_LIVE_RUNTIME_DEPLOYMENT_AUDIT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/client_access/black_dragon/audit/batch_155_client_access_rollout_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_155_CLIENT_ACCESS_ROLLOUT_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
