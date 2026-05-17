const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

const explainability = paths.paths.map(pathway => ({
  propagation_path_id:
    pathway.propagation_path_id,

  root_organization:
    pathway.root_organization,

  explainability_summary:
    `${pathway.root_organization} acts as a propagation-capable node connected to ${pathway.connected_targets.length} adjacent organizations.`,

  propagation_logic: {
    graph_relationships:
      pathway.connected_targets.length,

    propagation_capable_targets:
      pathway.connected_targets.filter(t =>
        t.propagation_capable
      ).length,

    conversion_capable_targets:
      pathway.connected_targets.filter(t =>
        t.conversion_path_capable
      ).length
  },

  client_interpretation:
    pathway.recommended_use ===
    "DIRECT_MANUAL_ACTION_PLUS_PROPAGATION"
      ? "This organization may create both direct sales opportunity and downstream awareness propagation."
      : "This organization may be strategically useful for influence propagation but requires additional review.",

  automated_outreach_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/propagation/propagation_explainability_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify({
    version:
      "black_dragon_propagation_explainability_registry_v1",

    generated_at:
      new Date().toISOString(),

    explainability_records:
      explainability.length,

    explainability
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "PROPAGATION_EXPLAINABILITY_REGISTRY_COMPLETE",

  explainability_records:
    explainability.length,

  output:
    out
}, null, 2));
