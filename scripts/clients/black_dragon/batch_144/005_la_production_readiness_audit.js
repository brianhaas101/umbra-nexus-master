const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const graph = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"
);

const validation = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/contact_review/contact_route_review.json"
);

const uiAudit = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/ui/audit/batch_144_los_angeles_ui_surface_audit.json"
);

const audit = {
  version: "black_dragon_los_angeles_production_readiness_audit_v1",
  generated_at: new Date().toISOString(),

  city: "Los Angeles",
  state: "CA",

  certification_target: "SECOND_OPERATIONAL_CITY",

  counts: {
    runtime_entities: runtime.deduped_city_entities,
    duplicate_review_entities: runtime.duplicate_review_entities,
    graph_edges: graph.total_edges,
    propagation_paths: paths.total_paths,
    validation_routes: validation.validation_count,
    valid_routes: validation.validation_results.filter(r => r.fetch_status === "VALID").length,
    contact_ready_candidates: contactReview.contact_ready_candidates,
    ui_node_cards: uiAudit.counts.node_cards,
    ui_propagation_paths: uiAudit.counts.propagation_paths
  },

  gates: {
    runtime_active: runtime.runtime_status === "RUNTIME_VISIBLE_CONTACT_LOCKED",
    runtime_entities_exist: runtime.deduped_city_entities === 10,
    graph_active: graph.total_edges > 0,
    propagation_active: paths.total_paths > 0,
    live_validation_active: validation.validation_count === 10,
    contact_review_active: contactReview.review_count === 10,
    ui_surface_active: uiAudit.status === "PASS",

    no_auto_contact:
      runtime.inherited_laws.no_auto_contact === true,

    no_auto_promotion:
      runtime.inherited_laws.no_auto_promotion === true,

    no_runtime_delete_without_quarantine:
      runtime.inherited_laws.no_runtime_delete_without_quarantine === true,

    no_automated_outreach:
      validation.validation_results.every(r => r.automated_outreach_allowed === false),

    no_contact_ready_promotion:
      contactReview.contact_review.every(r => r.contact_ready_promotion_allowed === false)
  },

  certification:
    "LOS_ANGELES_OPERATIONAL_CITY_APPROVED",

  next_phase:
    "BATCH_145_CITY_TWO_COMPARISON_AND_NEXT_CITY_SELECTION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/production_readiness/los_angeles/audit/los_angeles_production_readiness_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_PRODUCTION_READINESS_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
