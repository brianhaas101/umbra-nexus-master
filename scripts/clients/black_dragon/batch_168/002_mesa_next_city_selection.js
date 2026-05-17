const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const selection = {
  version: "black_dragon_arizona_next_city_selection_v1",
  generated_at: new Date().toISOString(),

  state: "Arizona",

  selected_next_city: {
    city: "Mesa",
    state: "AZ",
    selection_rank: 1,
    selection_status: "APPROVED_NEXT_CITY",
    planned_role: "ARIZONA_THIRD_OPERATIONAL_CITY"
  },

  rationale: [
    "Extends the Phoenix/Scottsdale metro intelligence corridor.",
    "Adds dealership and community density before expanding south to Tucson.",
    "Likely overlaps with Phoenix rider groups, dealer ecosystems, and Arizona Bike Week spillover.",
    "Improves Arizona federation quality before state-level certification."
  ],

  expected_source_categories: [
    "DEALERSHIP_NETWORKS",
    "COMMUNITY_RIDING_GROUPS",
    "EVENT_PROPAGATION",
    "VETERAN_AND_NONPROFIT",
    "PHOENIX_METRO_OVERLAP"
  ],

  production_sequence: [
    "BATCH_169_MESA_RUNTIME_TEMPLATE_INITIALIZATION",
    "BATCH_170_MESA_ENTITY_DISCOVERY_IMPORT",
    "BATCH_171_MESA_RUNTIME_MERGE_AND_GRAPH",
    "BATCH_172_MESA_LIVE_VALIDATION",
    "BATCH_173_MESA_UI_AND_PRODUCTION_AUDIT"
  ],

  hardlocks_to_inherit: [
    "NO_AUTO_CONTACT",
    "NO_AUTO_PROMOTION",
    "NO_RUNTIME_MUTATION",
    "NO_RUNTIME_DELETE_WITHOUT_QUARANTINE",
    "QUARANTINE_BEFORE_RUNTIME",
    "MANUAL_REVIEW_REQUIRED_FOR_CONTACT"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/next_city/mesa_next_city_selection.json"
);

fs.writeFileSync(out, JSON.stringify(selection, null, 2), "utf8");

console.log(JSON.stringify({
  status: "MESA_NEXT_CITY_SELECTION_COMPLETE",
  selected_next_city: selection.selected_next_city,
  output: out
}, null, 2));
