const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const selection = {
  version: "black_dragon_next_city_selection_v1",
  generated_at: new Date().toISOString(),

  selected_next_city: {
    city: "San Diego",
    state: "CA",
    selection_rank: 1,
    selection_status: "APPROVED_NEXT_CITY"
  },

  rationale: [
    "Extends Southern California corridor.",
    "Likely overlap with Long Beach and Los Angeles motorcycle ecosystems.",
    "Strong dealership, event, rider, military/veteran, and coastal riding-network potential.",
    "Better next step than statewide rollout because city-level production quality remains the priority."
  ],

  expected_source_categories: [
    "DEALERSHIP_NETWORKS",
    "EVENT_DISCOVERY",
    "VETERAN_AND_LEMC_NETWORKS",
    "COMMUNITY_VENUES",
    "MOTORCYCLE_MEDIA"
  ],

  production_sequence: [
    "BATCH_146_SAN_DIEGO_TEMPLATE_ALIGNMENT",
    "BATCH_147_SAN_DIEGO_ENTITY_DISCOVERY_IMPORT",
    "BATCH_148_SAN_DIEGO_RUNTIME_MERGE_AND_GRAPH",
    "BATCH_149_SAN_DIEGO_LIVE_VALIDATION",
    "BATCH_150_SAN_DIEGO_UI_AND_PRODUCTION_AUDIT"
  ],

  hardlocks_to_inherit: [
    "NO_AUTO_CONTACT",
    "NO_AUTO_PROMOTION",
    "NO_RUNTIME_DELETION",
    "QUARANTINE_BEFORE_RUNTIME",
    "MANUAL_REVIEW_REQUIRED_FOR_CONTACT"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/multi_city/next_city/next_city_selection.json"
);

fs.writeFileSync(out, JSON.stringify(selection, null, 2), "utf8");

console.log(JSON.stringify({
  status: "NEXT_CITY_SELECTION_COMPLETE",
  selected_next_city: selection.selected_next_city,
  output: out
}, null, 2));
