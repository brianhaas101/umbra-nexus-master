const fs = require("fs");
const path = require("path");

const dashboardPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json"
);

const widgetsPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/snapshots/client_operator_dashboard_snapshot.v1.json"
);

const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));
const widgets = JSON.parse(fs.readFileSync(widgetsPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const audit = {
  version: "black_dragon_books_batch_028_dashboard_audit_v1",
  generated_at: new Date().toISOString(),

  dashboard_integrity: {
    dashboard_exists: !!dashboard,
    client_scope_black_dragon: dashboard.client.client_id === "black_dragon",
    operator_mode_client_safe: dashboard.client.operator_mode === "CLIENT_SAFE",
    has_headline_metrics: !!dashboard.headline_metrics,
    has_priority_summary: !!dashboard.priority_summary,
    has_outreach_summary: !!dashboard.outreach_summary,
    has_response_summary: !!dashboard.response_summary,
    has_top_actions: Array.isArray(dashboard.top_operational_actions),
    has_operator_workflow: Array.isArray(dashboard.operator_workflow)
  },

  widget_integrity: {
    widgets_exist: !!widgets,
    widget_count_valid: widgets.widgets.length >= 5,
    all_widgets_client_visible: widgets.widgets.every(w => w.client_visible === true),
    has_target_widget: widgets.widgets.some(w => w.widget_id === "BD_WIDGET_TARGET_TOTALS"),
    has_outreach_widget: widgets.widgets.some(w => w.widget_id === "BD_WIDGET_OUTREACH_READY"),
    has_revenue_widget: widgets.widgets.some(w => w.widget_id === "BD_WIDGET_PROJECTED_REVENUE")
  },

  snapshot_integrity: {
    snapshot_exists: !!snapshot,
    has_client_scope: snapshot.client.client_id === "black_dragon",
    has_next_actions: Array.isArray(snapshot.next_best_actions),
    has_metrics: !!snapshot.headline_metrics
  },

  data_shape_integrity: {
    total_targets_is_number: typeof dashboard.headline_metrics.total_operational_targets === "number",
    outreach_ready_is_number: typeof dashboard.headline_metrics.outreach_ready === "number",
    projected_revenue_is_number: typeof dashboard.headline_metrics.projected_revenue_total === "number",
    top_actions_have_entity_ids: dashboard.top_operational_actions.every(a => !!a.entity_id)
  }
};

audit.pass =
  Object.values(audit.dashboard_integrity).every(Boolean) &&
  Object.values(audit.widget_integrity).every(Boolean) &&
  Object.values(audit.snapshot_integrity).every(Boolean) &&
  Object.values(audit.data_shape_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_028_dashboard_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
