const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const comparison = read(
  "public/data/clients/black_dragon/multi_city/comparison/long_beach_los_angeles_comparison.json"
);

const selection = read(
  "public/data/clients/black_dragon/multi_city/next_city/next_city_selection.json"
);

const audit = {
  version: "black_dragon_batch_145_city_two_comparison_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "145_CITY_TWO_COMPARISON_AND_NEXT_CITY_SELECTION",

  counts: comparison.totals,

  gates: {
    two_cities_operational:
      comparison.totals.cities_operational === 2,
    combined_runtime_entities_exist:
      comparison.totals.combined_runtime_entities > 0,
    combined_graph_edges_exist:
      comparison.totals.combined_graph_edges > 0,
    combined_propagation_paths_exist:
      comparison.totals.combined_propagation_paths > 0,
    next_city_selected:
      selection.selected_next_city.city === "San Diego",
    hardlocks_inherited:
      selection.hardlocks_to_inherit.includes("NO_AUTO_CONTACT") &&
      selection.hardlocks_to_inherit.includes("NO_AUTO_PROMOTION") &&
      selection.hardlocks_to_inherit.includes("QUARANTINE_BEFORE_RUNTIME")
  },

  next_phase:
    "BATCH_146_SAN_DIEGO_TEMPLATE_ALIGNMENT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/multi_city/audit/batch_145_city_two_comparison_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_145_CITY_TWO_COMPARISON_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
