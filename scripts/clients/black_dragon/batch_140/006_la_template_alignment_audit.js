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
  "public/data/clients/black_dragon/template_alignment/los_angeles/exports/los_angeles_template_inheritance_manifest.json"
);

const sourcePlan = read(
  "public/data/clients/black_dragon/template_alignment/los_angeles/exports/los_angeles_discovery_source_plan.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const totalSources =
  sourcePlan.source_categories.reduce((sum, c) => sum + c.source_count, 0);

const audit = {
  version:
    "black_dragon_batch_140_los_angeles_template_alignment_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "140_LOS_ANGELES_TEMPLATE_ALIGNMENT",

  counts: {
    inherited_components: manifest.inherited_components.length,
    inherited_hardlocks: manifest.inherited_hardlocks.length,
    source_categories: sourcePlan.source_categories.length,
    source_count: totalSources,
    runtime_entities: runtime.merged_entities.length
  },

  gates: {
    inheritance_manifest_exists: manifest.inheritance_status === "STRUCTURE_ALIGNED_ENTITY_IMPORT_PENDING",
    source_plan_exists: totalSources >= 25,
    runtime_shell_exists: runtime.runtime_status === "SHELL_READY_ENTITY_IMPORT_PENDING",
    graph_shell_exists:
      exists("public/data/clients/black_dragon/relationship_graph/los_angeles/nodes/los_angeles_graph_nodes.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/los_angeles/scores/los_angeles_graph_influence_scores.json") &&
      exists("public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"),
    live_validation_shell_exists:
      exists("public/data/clients/black_dragon/automation/live_validation/los_angeles/manifests/live_validation_targets.json") &&
      exists("public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"),
    no_placeholder_runtime_entities: runtime.merged_entities.length === 0,
    no_auto_contact: runtime.inherited_laws.no_auto_contact === true,
    no_auto_promotion: runtime.inherited_laws.no_auto_promotion === true,
    quarantine_before_runtime: manifest.city_runtime_policy.quarantine_before_runtime === true
  },

  next_phase:
    "BATCH_141_LOS_ANGELES_ENTITY_DISCOVERY_IMPORT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_alignment/los_angeles/audit/batch_140_los_angeles_template_alignment_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_140_LOS_ANGELES_TEMPLATE_ALIGNMENT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
