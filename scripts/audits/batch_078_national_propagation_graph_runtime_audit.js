const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const runtime =
  readJson(
    "public/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json"
  );

const index =
  readJson(
    "public/data/clients/black_dragon/graph/indexes/graph_index.v1.json"
  );

const chains =
  readJson(
    "public/data/clients/black_dragon/graph/indexes/propagation_chain_index.v1.json"
  );

const edges =
  runtime.graph_edges || [];

const graphIndex =
  index.graph_index || {};

const propagationChains =
  chains.propagation_chains || [];

const audit = {
  version:
    "umbra_batch_078_national_propagation_graph_runtime_audit_v1",

  generated_at:
    new Date().toISOString(),

  runtime_integrity: {
    entities:
      runtime.totals.entities,

    ecosystems:
      runtime.totals.ecosystems,

    graph_edges:
      runtime.totals.graph_edges,

    propagation_chains:
      runtime.totals.propagation_chains,

    propagation_enabled:
      runtime.graph_runtime.propagation_enabled === true,

    regional_weighting_enabled:
      runtime.graph_runtime.regional_weighting_enabled === true,

    cross_ecosystem_overlap_enabled:
      runtime.graph_runtime.cross_ecosystem_overlap_enabled === true,

    chain_scoring_enabled:
      runtime.graph_runtime.chain_scoring_enabled === true
  },

  edge_integrity: {
    all_edges_have_ids:
      edges.every(e => !!e.edge_id),

    all_edges_have_strength:
      edges.every(e =>
        typeof e.propagation_strength === "number"
      ),

    all_edges_blocked_from_outreach:
      edges.every(e => e.outreach_allowed === false),

    has_intra_city_edges:
      edges.some(e =>
        e.relationship_type === "INTRA_CITY_PROPAGATION"
      ),

    has_regional_edges:
      edges.some(e =>
        e.relationship_type === "REGIONAL_PROPAGATION"
      )
  },

  graph_index_integrity: {
    indexed_entities:
      Object.keys(graphIndex).length,

    all_entities_indexed:
      Object.keys(graphIndex).length === runtime.totals.entities,

    propagation_scores_present:
      Object.values(graphIndex).every(x =>
        typeof x.propagation_score === "number"
      )
  },

  chain_integrity: {
    chains_present:
      propagationChains.length > 0,

    all_chains_have_strength:
      propagationChains.every(c =>
        typeof c.strength === "number"
      ),

    all_chains_have_ecosystems:
      propagationChains.every(c =>
        Array.isArray(c.ecosystems) &&
        c.ecosystems.length >= 2
      )
  },

  safety_integrity: {
    outreach_allowed_zero:
      runtime.totals.outreach_allowed === 0,

    auto_outreach_blocked:
      runtime.graph_runtime.blocked_features.includes(
        "auto_outreach"
      ),

    auto_contact_blocked:
      runtime.graph_runtime.blocked_features.includes(
        "auto_contact_generation"
      )
  }
};

audit.pass =
  audit.runtime_integrity.entities >= 1000 &&
  audit.runtime_integrity.ecosystems === 5 &&
  audit.runtime_integrity.graph_edges > 10000 &&
  audit.runtime_integrity.propagation_chains > 10000 &&
  audit.runtime_integrity.propagation_enabled &&
  audit.runtime_integrity.regional_weighting_enabled &&
  audit.runtime_integrity.cross_ecosystem_overlap_enabled &&
  audit.runtime_integrity.chain_scoring_enabled &&
  audit.edge_integrity.all_edges_have_ids &&
  audit.edge_integrity.all_edges_have_strength &&
  audit.edge_integrity.all_edges_blocked_from_outreach &&
  audit.edge_integrity.has_intra_city_edges &&
  audit.edge_integrity.has_regional_edges &&
  audit.graph_index_integrity.indexed_entities >= 1000 &&
  audit.graph_index_integrity.all_entities_indexed &&
  audit.graph_index_integrity.propagation_scores_present &&
  audit.chain_integrity.chains_present &&
  audit.chain_integrity.all_chains_have_strength &&
  audit.chain_integrity.all_chains_have_ecosystems &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.auto_outreach_blocked &&
  audit.safety_integrity.auto_contact_blocked;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/graph/audit/batch_078_national_propagation_graph_runtime_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
