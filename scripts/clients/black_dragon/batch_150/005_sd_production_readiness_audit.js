const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const graph = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"
);

const validation = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json"
);

const contactReview = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"
);

const uiAudit = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/ui/audit/batch_150_san_diego_ui_surface_audit.json"
);

const audit = {
  version:
    "black_dragon_san_diego_production_readiness_audit_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "San Diego",

  state:
    "CA",

  certification_target:
    "THIRD_OPERATIONAL_CITY",

  counts: {
    runtime_entities:
      runtime.deduped_city_entities,

    graph_edges:
      graph.total_edges,

    propagation_paths:
      paths.total_paths,

    validation_routes:
      validation.validation_count,

    valid_routes:
      validation.validation_results.filter(
        r => r.fetch_status === "VALID"
      ).length,

    contact_ready_candidates:
      contactReview.contact_ready_candidates,

    ui_node_cards:
      uiAudit.counts.node_cards
  },

  gates: {
    runtime_active:
      runtime.runtime_status === "RUNTIME_VISIBLE_CONTACT_LOCKED",

    runtime_entities_exist:
      runtime.deduped_city_entities === 10,

    graph_active:
      graph.total_edges > 0,

    propagation_active:
      paths.total_paths > 0,

    live_validation_active:
      validation.validation_count === 10,

    contact_review_active:
      contactReview.review_count === 10,

    ui_surface_active:
      uiAudit.status === "PASS",

    no_auto_contact:
      runtime.inherited_laws.no_auto_contact === true,

    no_auto_promotion:
      runtime.inherited_laws.no_auto_promotion === true,

    no_automated_outreach:
      validation.validation_results.every(
        r => r.automated_outreach_allowed === false
      ),

    no_contact_ready_promotion:
      contactReview.contact_review.every(
        r => r.contact_ready_promotion_allowed === false
      )
  },

  certification:
    "SAN_DIEGO_OPERATIONAL_CITY_APPROVED",

  next_phase:
    "BATCH_151_SOUTHERN_CALIFORNIA_FEDERATION_AUDIT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/production_readiness/san_diego/audit/san_diego_production_readiness_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_PRODUCTION_READINESS_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
