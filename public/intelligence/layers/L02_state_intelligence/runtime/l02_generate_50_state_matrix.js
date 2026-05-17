import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");

const states = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];

const categories = [
  "state_open_data_portals",
  "state_emergency_management",
  "state_police_public_safety",
  "state_courts",
  "state_environmental_agency",
  "state_transportation",
  "state_labor_workforce",
  "state_housing",
  "state_education",
  "state_health_services",
  "state_energy_utilities",
  "state_business_regulation",
  "state_procurement",
  "state_corrections",
  "state_elections"
];

const targets = [];

for (const [state_code, state_name] of states) {
  for (const category of categories) {
    targets.push(Object.freeze({
      target_id: `L02_${state_code}_${category}`,
      layer_id: "L02",
      state_code,
      state_name,
      category,
      connector_active: false,
      normalizer_active: false,
      status: "coverage_stub_created",
      source_url: null,
      last_refresh: null,
      state_local_provenance_required: true,
      replay_hashing_required: true,
      synthetic_fillers_allowed: false,
      inferred_contacts_allowed: false,
      client_paths_touched: false
    }));
  }
}

const matrix = Object.freeze({
  matrix_id: "L02_50_state_15_category_matrix",
  version: "1.0.0",
  states_required: 50,
  categories_required_per_state: 15,
  total_targets_required: 750,
  total_targets_created: targets.length,
  targets
});

fs.writeFileSync(
  path.join(l02, "schemas", "state_coverage_matrix.json"),
  JSON.stringify(matrix, null, 2)
);

if (targets.length !== 750) {
  throw new Error(`Expected 750 targets. Found ${targets.length}.`);
}

console.log("L02_50_STATE_MATRIX_GENERATED_PASS");
