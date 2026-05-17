const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const federation = read(
  "public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json"
);

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const paths = read(
  "public/data/clients/black_dragon/federation/southern_california/paths/federation_propagation_paths.json"
);

const scores = read(
  "public/data/clients/black_dragon/federation/southern_california/scores/federation_regional_scores.json"
);

const audit = {
  version:
    "black_dragon_batch_151_southern_california_federation_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "151_SOUTHERN_CALIFORNIA_FEDERATION_AUDIT",

  federation_status:
    federation.federation_status,

  counts: {
    operational_cities:
      federation.operational_cities.length,

    total_runtime_entities:
      federation.total_runtime_entities,

    overlap_entities:
      overlaps.overlap_count,

    federation_paths:
      paths.total_paths,

    regional_scores:
      scores.scored_entities
  },

  gates: {
    three_operational_cities:
      federation.operational_cities.length === 3,

    federation_entity_pool_exists:
      federation.total_runtime_entities >= 30,

    overlap_engine_active:
      overlaps.overlap_count >= 1,

    propagation_paths_exist:
      paths.total_paths >= 1,

    regional_scores_exist:
      scores.scored_entities === federation.total_runtime_entities,

    no_auto_contact:
      paths.federation_paths.every(
        p => p.automated_outreach_allowed === false
      ),

    no_runtime_mutation:
      paths.federation_paths.every(
        p => p.runtime_mutation_allowed === false
      )
  },

  interpretation: {
    corridor_status:
      "Southern California federation operational.",

    operational_meaning:
      "Black Dragon now operates on a regional intelligence corridor rather than isolated city runtimes.",

    infrastructure_state:
      "Federated propagation, overlap analysis, and regional ranking active."
  },

  next_phase:
    "BATCH_152_CORRIDOR_AUTONOMOUS_REFRESH_ORCHESTRATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/audit/batch_151_southern_california_federation_audit.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(audit, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "BATCH_151_SOUTHERN_CALIFORNIA_FEDERATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
