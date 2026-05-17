const fs = require("fs");
const path = require("path");

const dashboardPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json"
);

const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

const widgets = {
  version: "black_dragon_books_client_dashboard_widgets_v1",
  generated_at: new Date().toISOString(),

  widgets: [
    {
      widget_id: "BD_WIDGET_TARGET_TOTALS",
      title: "Operational Targets",
      type: "metric_card",
      value: dashboard.headline_metrics.total_operational_targets,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_OUTREACH_READY",
      title: "Outreach Ready",
      type: "metric_card",
      value: dashboard.headline_metrics.outreach_ready,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_CONTACT_ENRICHMENT",
      title: "Needs Contact Enrichment",
      type: "metric_card",
      value: dashboard.headline_metrics.needs_contact_enrichment,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_PROJECTED_REVENUE",
      title: "Projected Revenue",
      type: "metric_card",
      value: dashboard.headline_metrics.projected_revenue_total,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_PRIORITY_SUMMARY",
      title: "Priority Summary",
      type: "summary_panel",
      value: dashboard.priority_summary,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_RESPONSE_SUMMARY",
      title: "Response Summary",
      type: "summary_panel",
      value: dashboard.response_summary,
      client_visible: true
    },
    {
      widget_id: "BD_WIDGET_TOP_ACTIONS",
      title: "Top Operational Actions",
      type: "action_list",
      value: dashboard.top_operational_actions,
      client_visible: true
    }
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(widgets, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_DASHBOARD_WIDGETS_BUILD_COMPLETE",
  widgets: widgets.widgets.length,
  output: outputPath
}, null, 2));
