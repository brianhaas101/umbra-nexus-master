const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const adaptivePath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const responsesPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const kpiPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const contactsPath = path.resolve(
  "public/data/clients/black_dragon/books/contacts/enriched/public_contact_enrichment.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json"
);

const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const adaptive = JSON.parse(fs.readFileSync(adaptivePath, "utf8"));
const responses = JSON.parse(fs.readFileSync(responsesPath, "utf8"));
const kpi = JSON.parse(fs.readFileSync(kpiPath, "utf8"));
const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf8"));

const queueItems = queue.all_queue_items || [];
const adaptiveTargets = adaptive.targets || [];
const classifiedResponses = responses.responses || [];
const kpiTargets = kpi.targets || [];

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
    total_operational_targets: operational.length,
    outreach_ready: queueItems.filter(q => q.queue_status === "READY").length,
    needs_contact_enrichment: queueItems.filter(q => q.queue_status === "NEEDS_CONTACT_ENRICHMENT").length,
    adaptive_targets: adaptiveTargets.length,
    responses_logged: classifiedResponses.length,
    contacts_with_public_paths: contacts.filter(c => c.contact_paths && c.contact_paths.length > 0).length,
    projected_revenue_total: Number(
      kpiTargets.reduce((acc, t) => acc + Number(t.projected_revenue || 0), 0).toFixed(2)
    )
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
    engagement: classifiedResponses.filter(r => r.response_classification === "ENGAGEMENT_SIGNAL").length,
    interest: classifiedResponses.filter(r => r.response_classification === "INTEREST_SIGNAL").length,
    endorsement: classifiedResponses.filter(r => r.response_classification === "ENDORSEMENT_SIGNAL").length,
    bulk_order: classifiedResponses.filter(r => r.response_classification === "BULK_ORDER_SIGNAL").length,
    conversion: classifiedResponses.filter(r => r.response_classification === "CONVERSION_CONFIRMED").length,
    negative_fit: classifiedResponses.filter(r => r.response_classification === "NEGATIVE_FIT_SIGNAL").length,
    no_response: classifiedResponses.filter(r => r.response_classification === "NO_RESPONSE_SIGNAL").length
  },

  top_operational_actions:
    queueItems
      .slice()
      .sort((a,b) => (b.unified_priority_score || 0) - (a.unified_priority_score || 0))
      .slice(0, 10)
      .map(q => ({
        entity_id: q.entity_id,
        organization_name: q.organization_name,
        leader_role: q.leader_role,
        organization_type: q.organization_type,
        queue_status: q.queue_status,
        priority_score: q.unified_priority_score,
        priority_tier: q.unified_priority_tier,
        recommended_action: q.recommended_action,
        contact_route_type: q.best_contact_route ? q.best_contact_route.contact_type : null,
        message_subject: q.message_subject
      })),

  top_adaptive_targets:
    adaptiveTargets
      .slice()
      .sort((a,b) => (b.adaptive_priority_score || 0) - (a.adaptive_priority_score || 0))
      .slice(0, 10)
      .map(t => ({
        entity_id: t.entity_id,
        organization_name: t.organization_name,
        prior_priority_score: t.prior_priority_score,
        adaptive_priority_score: t.adaptive_priority_score,
        adaptive_priority_delta: t.adaptive_priority_delta,
        adaptive_priority_tier: t.adaptive_priority_tier,
        adaptive_recommended_action: t.adaptive_recommended_action
      })),

  operator_workflow: [
    {
      step: 1,
      label: "Review Outreach Queue",
      data_source: "queue/outreach_ready_queue.v1.json",
      client_visible: true
    },
    {
      step: 2,
      label: "Send Manual Outreach",
      data_source: "execution/test_pack_001/outreach_execution_test_pack_001.json",
      client_visible: true
    },
    {
      step: 3,
      label: "Log Responses",
      data_source: "responses/raw/raw_response_ingestion.v1.json",
      client_visible: true
    },
    {
      step: 4,
      label: "Review Adaptive Priorities",
      data_source: "adaptive_priority/adaptive_priority_index.v1.json",
      client_visible: true
    }
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(dashboard, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_OPERATOR_DASHBOARD_BUILD_COMPLETE",
  headline_metrics: dashboard.headline_metrics,
  output: outputPath
}, null, 2));
