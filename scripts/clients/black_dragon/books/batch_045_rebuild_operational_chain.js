const fs = require("fs");
const path = require("path");

const BOOKS = path.resolve("public/data/clients/black_dragon/books");

const operationalPath = path.join(BOOKS, "operational/black_dragon_books_operational_targets.v1.json");
const clientViewPath = path.join(BOOKS, "client_view/client_book_targets_view.v1.json");
const queuePath = path.join(BOOKS, "queue/outreach_ready_queue.v1.json");
const adaptivePath = path.join(BOOKS, "adaptive_priority/adaptive_priority_index.v1.json");
const kpiPath = path.join(BOOKS, "kpi/book_operational_kpis.v1.json");
const dashboardPath = path.join(BOOKS, "dashboard/client_operator_dashboard.v1.json");
const widgetsPath = path.join(BOOKS, "dashboard/widgets/client_dashboard_widgets.v1.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(Number(n || 0))));
}

function tier(score) {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}

function action(score, status) {
  if (status === "EXPANDED_REVIEW") return "REVIEW_AND_ENRICH";
  if (score >= 85) return "IMMEDIATE_OUTREACH";
  if (score >= 70) return "HIGH_PRIORITY_OUTREACH";
  if (score >= 50) return "QUEUE_FOR_OUTREACH";
  return "MONITOR_AND_ENRICH";
}

const targets = readJson(operationalPath).map((t, i) => ({
  ...t,
  entity_id: t.entity_id || `BD_BOOK_RECOVERED_${String(i + 1).padStart(5, "0")}`,
  propagation_score: clamp(t.propagation_score || t.priority_score || 50),
  operational_status: t.operational_status || "ACTIVE"
}));

writeJson(operationalPath, targets);

const clientView = targets.map(t => ({
  entity_id: t.entity_id,
  organization_name: t.organization_name,
  target_name: t.target_name || t.organization_name,
  organization_type: t.organization_type || "UNKNOWN",
  region: t.region || "National",
  propagation_score: t.propagation_score,
  operational_status: t.operational_status,
  client_visible: true
}));

writeJson(clientViewPath, clientView);

const queueItems = targets.map((t, i) => {
  const score = clamp(t.propagation_score);

  return {
    queue_id: `BD_BOOK_QUEUE_${String(i + 1).padStart(5, "0")}`,
    entity_id: t.entity_id,
    organization_name: t.organization_name,
    target_name: t.target_name || t.organization_name,
    leader_role: t.leader_role || "UNKNOWN_LEADER",
    organization_type: t.organization_type || "UNKNOWN",
    region: t.region || "National",
    queue_status:
      t.source_url || t.public_source_present
        ? "READY"
        : "NEEDS_CONTACT_ENRICHMENT",
    unified_priority_score: score,
    unified_priority_tier: tier(score),
    recommended_action: action(score, t.operational_status),
    best_contact_route: t.source_url
      ? {
          contact_type: "PUBLIC_SOURCE_URL",
          value: t.source_url
        }
      : null,
    message_subject: "Motorcycle Leadership Resource",
    message_body:
      "Hello — I wanted to share a motorcycle leadership and culture resource that may be relevant for your organization. If there is a better contact for this, please let me know."
  };
});

writeJson(queuePath, {
  version: "black_dragon_books_outreach_ready_queue_v1",
  generated_at: new Date().toISOString(),
  totals: {
    all: queueItems.length,
    ready: queueItems.filter(q => q.queue_status === "READY").length,
    needs_contact_enrichment: queueItems.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT").length
  },
  ready_queue: queueItems.filter(q => q.queue_status === "READY"),
  all_queue_items: queueItems
});

const adaptiveTargets = targets.map(t => {
  const score = clamp(t.propagation_score);

  return {
    entity_id: t.entity_id,
    organization_name: t.organization_name,
    target_name: t.target_name || t.organization_name,
    leader_role: t.leader_role || "UNKNOWN_LEADER",
    organization_type: t.organization_type || "UNKNOWN",
    prior_priority_score: score,
    adaptive_priority_score: score,
    adaptive_priority_delta: 0,
    adaptive_priority_tier: tier(score),
    response_status: null,
    response_classification: null,
    propagation_confidence: null,
    followup_required: false,
    adaptive_recommended_action: action(score, t.operational_status),
    updated_at: new Date().toISOString()
  };
});

writeJson(adaptivePath, {
  version: "black_dragon_books_adaptive_priority_index_v1",
  generated_at: new Date().toISOString(),
  totals: {
    total_targets: adaptiveTargets.length,
    critical: adaptiveTargets.filter(t => t.adaptive_priority_tier === "CRITICAL").length,
    high: adaptiveTargets.filter(t => t.adaptive_priority_tier === "HIGH").length,
    medium: adaptiveTargets.filter(t => t.adaptive_priority_tier === "MEDIUM").length,
    low: adaptiveTargets.filter(t => t.adaptive_priority_tier === "LOW").length,
    none: adaptiveTargets.filter(t => t.adaptive_priority_tier === "NONE").length,
    with_feedback: 0
  },
  top_operational_targets: adaptiveTargets.slice().sort((a,b) => b.adaptive_priority_score - a.adaptive_priority_score).slice(0,25),
  targets: adaptiveTargets
});

const kpiTargets = targets.map(t => ({
  entity_id: t.entity_id,
  organization_name: t.organization_name,
  projected_revenue: Number(t.projected_revenue || 0),
  propagation_score: clamp(t.propagation_score),
  operational_priority: clamp(t.propagation_score)
}));

writeJson(kpiPath, {
  version: "black_dragon_books_operational_kpis_v1",
  generated_at: new Date().toISOString(),
  targets: kpiTargets
});

const dashboard = {
  version: "black_dragon_books_client_operator_dashboard_v1",
  generated_at: new Date().toISOString(),
  client: {
    client_id: "black_dragon",
    active_module: "book_sales_v2",
    operator_mode: "CLIENT_SAFE",
    dashboard_scope: "BLACK_DRAGON_BOOKS_ONLY"
  },
  headline_metrics: {
    total_operational_targets: targets.length,
    outreach_ready: queueItems.filter(q => q.queue_status === "READY").length,
    needs_contact_enrichment: queueItems.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT").length,
    adaptive_targets: adaptiveTargets.length,
    responses_logged: 0,
    contacts_with_public_paths: queueItems.filter(q => !!q.best_contact_route).length,
    projected_revenue_total: Number(kpiTargets.reduce((a,t) => a + Number(t.projected_revenue || 0), 0).toFixed(2))
  },
  priority_summary: {
    critical: adaptiveTargets.filter(t => t.adaptive_priority_tier === "CRITICAL").length,
    high: adaptiveTargets.filter(t => t.adaptive_priority_tier === "HIGH").length,
    medium: adaptiveTargets.filter(t => t.adaptive_priority_tier === "MEDIUM").length,
    low: adaptiveTargets.filter(t => t.adaptive_priority_tier === "LOW").length,
    none: adaptiveTargets.filter(t => t.adaptive_priority_tier === "NONE").length
  },
  outreach_summary: {
    ready: queueItems.filter(q => q.queue_status === "READY").length,
    enrichment_needed: queueItems.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT").length,
    immediate_actions: queueItems.filter(q => q.recommended_action === "IMMEDIATE_OUTREACH").length,
    high_priority_actions: queueItems.filter(q => q.recommended_action === "HIGH_PRIORITY_OUTREACH").length,
    queued_actions: queueItems.filter(q => q.recommended_action === "QUEUE_FOR_OUTREACH").length
  },
  response_summary: {
    engagement: 0,
    interest: 0,
    endorsement: 0,
    bulk_order: 0,
    conversion: 0,
    negative_fit: 0,
    no_response: 0
  },
  top_operational_actions: queueItems.slice().sort((a,b) => b.unified_priority_score - a.unified_priority_score).slice(0,10),
  top_adaptive_targets: adaptiveTargets.slice().sort((a,b) => b.adaptive_priority_score - a.adaptive_priority_score).slice(0,10),
  operator_workflow: [
    { step: 1, label: "Review Outreach Queue", data_source: "queue/outreach_ready_queue.v1.json", client_visible: true },
    { step: 2, label: "Send Manual Outreach", data_source: "dashboard / queue UI", client_visible: true },
    { step: 3, label: "Log Responses", data_source: "response logging UI", client_visible: true },
    { step: 4, label: "Review Adaptive Priorities", data_source: "adaptive_priority/adaptive_priority_index.v1.json", client_visible: true }
  ]
};

writeJson(dashboardPath, dashboard);

writeJson(widgetsPath, {
  version: "black_dragon_books_client_dashboard_widgets_v1",
  generated_at: new Date().toISOString(),
  widgets: [
    { widget_id: "BD_WIDGET_TARGET_TOTALS", title: "Operational Targets", type: "metric_card", value: dashboard.headline_metrics.total_operational_targets, client_visible: true },
    { widget_id: "BD_WIDGET_OUTREACH_READY", title: "Outreach Ready", type: "metric_card", value: dashboard.headline_metrics.outreach_ready, client_visible: true },
    { widget_id: "BD_WIDGET_CONTACT_ENRICHMENT", title: "Needs Contact Enrichment", type: "metric_card", value: dashboard.headline_metrics.needs_contact_enrichment, client_visible: true },
    { widget_id: "BD_WIDGET_PROJECTED_REVENUE", title: "Projected Revenue", type: "metric_card", value: dashboard.headline_metrics.projected_revenue_total, client_visible: true },
    { widget_id: "BD_WIDGET_PRIORITY_SUMMARY", title: "Priority Summary", type: "summary_panel", value: dashboard.priority_summary, client_visible: true },
    { widget_id: "BD_WIDGET_RESPONSE_SUMMARY", title: "Response Summary", type: "summary_panel", value: dashboard.response_summary, client_visible: true },
    { widget_id: "BD_WIDGET_TOP_ACTIONS", title: "Top Operational Actions", type: "action_list", value: dashboard.top_operational_actions, client_visible: true }
  ]
});

console.log(JSON.stringify({
  status: "BATCH_045_OPERATIONAL_CHAIN_REBUILT",
  targets: targets.length,
  queue: queueItems.length,
  adaptive: adaptiveTargets.length,
  kpis: kpiTargets.length
}, null, 2));
