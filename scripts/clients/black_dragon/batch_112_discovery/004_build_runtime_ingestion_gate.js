const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const gate = {

  version:
    "black_dragon_runtime_ingestion_gate_v1",

  generated_at:
    new Date().toISOString(),

  runtime_ingestion_requirements: {

    real_public_source_verified:
      true,

    organization_name_verified:
      true,

    city_state_verified:
      true,

    dossier_built:
      true,

    audience_relevance_scored:
      true,

    mc_culture_relevance_scored:
      true,

    verified_contact_route_required_for_contact_ready:
      true,

    runtime_visibility_allowed_only_after_validation:
      true,

    automated_outreach_forbidden:
      true
  },

  prohibited_conditions: [

    "PLACEHOLDER_ORGANIZATION",
    "SYNTHETIC_CONTACT",
    "GENERATED_ENTITY",
    "MISSING_SOURCE_URL",
    "UNVERIFIED_CITY",
    "UNVERIFIED_STATE",
    "AUTO_CONTACT_ENABLED"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/templates/runtime_ingestion_gate.json"
);

fs.writeFileSync(out, JSON.stringify(gate, null, 2));

console.log(JSON.stringify({
  status: "RUNTIME_INGESTION_GATE_COMPLETE",
  prohibited_conditions: gate.prohibited_conditions.length,
  output: out
}, null, 2));
