const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const manifest = {
  version:
    "black_dragon_arizona_master_state_manifest_v1",

  generated_at:
    new Date().toISOString(),

  state_id:
    "ARIZONA_OPERATIONAL_CORRIDOR_V1",

  state:
    "Arizona",

  inherited_from:
    "SOUTHERN_CALIFORNIA_MASTER_TEMPLATE",

  federation_type:
    "STATE_OPERATIONAL_FEDERATION",

  operational_model: {
    runtime_architecture:
      "CITY_TO_STATE_FEDERATION",

    overlap_model:
      "CONFIDENCE_WEIGHTED_OVERLAP",

    propagation_model:
      "MULTI_CITY_PROPAGATION_INTELLIGENCE",

    refresh_model:
      "RECURRING_AUTONOMOUS_REFRESH",

    client_model:
      "CLIENT_READY_WITH_MANUAL_ACTION_LOCKS"
  },

  inherited_hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_mutation: true,
    founder_admin_isolated: true,
    quarantine_before_runtime: true
  },

  target_cities: [
    {
      city: "Phoenix",
      role: "PRIMARY_OPERATIONAL_HUB"
    },
    {
      city: "Scottsdale",
      role: "LUXURY_AND_EVENT_OVERLAP"
    },
    {
      city: "Mesa",
      role: "COMMUNITY_AND_DEALERSHIP_OVERLAP"
    },
    {
      city: "Tucson",
      role: "SOUTHERN_PROPAGATION_EXTENSION"
    }
  ],

  certification_goal:
    "FIRST_NON_CALIFORNIA_OPERATIONAL_STATE"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/templates/arizona_master_state_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");

console.log(JSON.stringify({
  status: "ARIZONA_MASTER_STATE_MANIFEST_COMPLETE",
  target_cities: manifest.target_cities.length,
  output: out
}, null, 2));
