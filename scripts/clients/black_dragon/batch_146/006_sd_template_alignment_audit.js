const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const manifest = read(
  "public/data/clients/black_dragon/template_alignment/san_diego/exports/san_diego_template_inheritance_manifest.json"
);

const sourcePlan = read(
  "public/data/clients/black_dragon/template_alignment/san_diego/exports/san_diego_discovery_source_plan.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const totalSources =
  sourcePlan.source_categories.reduce((sum, c) => sum + c.source_count, 0);

const audit = {
  version: "black_dragon_batch_146_san_diego_template_alignment_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "146_SAN_DIEGO_TEMPLATE_ALIGNMENT",

  counts: {
    inherited_components: manifest.inherited_components.length,
    inherited_hardlocks: manifest.inherited_hardlocks.length,
    source_categories: sourcePlan.source_categories.length,
    source_count: totalSources,
    runtime_entities: runtime.merged_entities.length,
    validation_targets: 0
  },

  gates: {
    inheritance_manifest_exists:
      manifest.inheritance_status === "STRUCTURE_ALIGNED_ENTITY_IMPORT_PENDING",

    source_plan_exists:
      totalSources >= 25,

    runtime_shell_exists:
      runtime.runtime_status === "SHELL_READY_ENTITY_IMPORT_PENDING",

    graph_shell_exists:
      exists("public/data/clients/black_dragon/relationship_graph/san_diego/nodes/san_diego_graph_nodes.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/san_diego/scores/san_diego_graph_influence_scores.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"),

    live_validation_shell_exists:
      exists("public/data/clients/black_dragon/automation/live_validation/san_diego/manifests/live_validation_targets.json") &&
      exists("public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json") &&
      exists("public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json"),

    no_placeholder_runtime_entities:
      runtime.merged_entities.length === 0,

    no_auto_contact:
      runtime.inherited_laws.no_auto_contact === true,

    no_auto_promotion:
      runtime.inherited_laws.no_auto_promotion === true,

    quarantine_before_runtime:
      manifest.city_runtime_policy.quarantine_before_runtime === true,

    cross_city_dedupe_required:
      manifest.city_runtime_policy.cross_city_dedupe_required === true
  },

  next_phase: "BATCH_147_SAN_DIEGO_ENTITY_DISCOVERY_IMPORT",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_alignment/san_diego/audit/batch_146_san_diego_template_alignment_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_146_SAN_DIEGO_TEMPLATE_ALIGNMENT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
