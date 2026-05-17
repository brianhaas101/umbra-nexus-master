const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const accessAudit = read(
  "public/data/clients/black_dragon/client_access/black_dragon/audit/batch_155_client_access_rollout_audit.json"
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

const report = {
  version:
    "black_dragon_socal_client_access_deployment_verify_v1",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon_omg_cert_v1",

  certification:
    accessAudit.certification,

  dashboard_visible:
    dashboard.client_visible === true,

  feed_visible:
    feed.client_visible === true,

  queues_visible:
    queues.client_visible === true,

  visible_counts: {
    dashboard_runtime_entities:
      dashboard.region_summary.total_runtime_entities,

    refined_client_opportunities:
      feed.opportunities.length,

    manual_contact_review_items:
      queues.queues.manual_contact_review.item_count,

    route_issue_review_items:
      queues.queues.route_issue_review.item_count
  },

  client_locks: {
    no_auto_contact:
      accessAudit.gates.no_auto_contact === true,

    no_auto_promotion:
      accessAudit.gates.no_auto_promotion === true,

    no_runtime_mutation:
      accessAudit.gates.no_runtime_mutation === true,

    founder_admin_forbidden:
      accessAudit.gates.founder_admin_forbidden === true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/deployment/southern_california/reports/client_access_deployment_verify.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CLIENT_ACCESS_DEPLOYMENT_VERIFY_COMPLETE",
  certification: report.certification,
  output: out
}, null, 2));
