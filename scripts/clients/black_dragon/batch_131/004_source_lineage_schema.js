const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const lineage = {
  version:
    "black_dragon_source_lineage_schema_v1",

  generated_at:
    new Date().toISOString(),

  lineage_requirements: {
    source_id_required: true,
    source_type_required: true,
    discovered_at_required: true,
    last_verified_required: true,
    reliability_weight_required: true,
    candidate_before_runtime_required: true,
    quarantine_tracking_required: true,
    route_validation_required: true
  },

  runtime_preservation_rules: {
    source_layers_preserved: true,
    source_records_preserved: true,
    dedupe_lineage_preserved: true,
    mutation_history_preserved: true,
    score_change_history_preserved: true
  },

  suppression_rules: {
    dead_links_suppressed: true,
    broken_routes_decay: true,
    inactive_entities_decay: true,
    stale_entities_flagged: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/database_expansion/lineage/source_lineage_schema.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(lineage, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "SOURCE_LINEAGE_SCHEMA_COMPLETE",

  output:
    out
}, null, 2));
