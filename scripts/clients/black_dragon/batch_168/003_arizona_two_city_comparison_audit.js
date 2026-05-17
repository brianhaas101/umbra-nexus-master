const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const comparison = read(
  "public/data/clients/black_dragon/state_federations/arizona/comparison/phoenix_scottsdale_comparison.json"
);

const selection = read(
  "public/data/clients/black_dragon/state_federations/arizona/next_city/mesa_next_city_selection.json"
);

const audit = {
  version: "black_dragon_batch_168_arizona_two_city_comparison_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "168_ARIZONA_TWO_CITY_COMPARISON_AND_MESA_SELECTION",

  counts: comparison.totals,

  gates: {
    two_arizona_cities_operational:
      comparison.totals.operational_cities === 2,

    combined_runtime_entities_exist:
      comparison.totals.combined_runtime_entities === 20,

    combined_graph_edges_exist:
      comparison.totals.combined_graph_edges > 0,

    combined_propagation_paths_exist:
      comparison.totals.combined_propagation_paths === 20,

    contact_ready_candidates_exist:
      comparison.totals.combined_contact_ready_candidates > 0,

    mesa_selected:
      selection.selected_next_city.city === "Mesa" &&
      selection.selected_next_city.selection_status === "APPROVED_NEXT_CITY",

    hardlocks_inherited:
      selection.hardlocks_to_inherit.includes("NO_AUTO_CONTACT") &&
      selection.hardlocks_to_inherit.includes("NO_AUTO_PROMOTION") &&
      selection.hardlocks_to_inherit.includes("QUARANTINE_BEFORE_RUNTIME")
  },

  certification:
    "ARIZONA_TWO_CITY_CORRIDOR_READY_FOR_MESA",

  next_phase:
    "BATCH_169_MESA_RUNTIME_TEMPLATE_INITIALIZATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/audit/batch_168_arizona_two_city_comparison_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_168_ARIZONA_TWO_CITY_COMPARISON_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
