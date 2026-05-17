const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const confidence = edges.edges.map(edge => {

  let band = "LOW";

  if (edge.edge_weight >= 0.75) {
    band = "HIGH";
  }
  else if (edge.edge_weight >= 0.50) {
    band = "MEDIUM";
  }

  return {
    graph_edge_id:
      edge.graph_edge_id,

    source_organization:
      edge.source_organization,

    target_organization:
      edge.target_organization,

    relationship_type:
      edge.relationship_type,

    edge_weight:
      edge.edge_weight,

    confidence_band:
      band,

    confidence_reasoning:
      edge.shared_layer_count > 1
        ? "Multiple overlapping runtime layers detected."
        : edge.propagation_capable
          ? "Propagation-capable relationship pathway."
          : "Basic graph relationship detected.",

    runtime_mutation_allowed:
      false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/template_hardening/long_beach/graph/graph_edge_confidence_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify({
    version:
      "black_dragon_graph_edge_confidence_registry_v1",

    generated_at:
      new Date().toISOString(),

    total_edge_confidence_records:
      confidence.length,

    confidence
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "GRAPH_EDGE_CONFIDENCE_REGISTRY_COMPLETE",

  confidence_records:
    confidence.length,

  output:
    out
}, null, 2));
