const fs = require("fs");

const OUT = "public/data/clients/black_dragon/runtime_authority_map.json";

const map = {
  version: "black_dragon_runtime_authority_map_v1",
  generated_at: new Date().toISOString(),

  authority_rules: {
    verified_contacts_only: true,
    no_unverified_outreach: true,
    no_generic_email_final_targets: true,
    official_sources_only: true
  },

  runtime_authorities: {
    dossiers: "dossier_targets.json",
    national_shortlist: "national_verified_outreach_shortlist.json",
    execution_log: "outreach_execution_log.json",
    normalized_outputs: "normalized_intelligence_outputs.json",
    client_sync: "black_dragon_client_sync.json"
  },

  operational_states: [
    "CANDIDATE_REVIEW_REQUIRED",
    "NEEDS_MANUAL_VERIFICATION",
    "READY_TO_CALL",
    "CONTACTED",
    "FOLLOW_UP_REQUIRED",
    "CONVERTED",
    "REJECTED"
  ]
};

fs.writeFileSync(OUT, JSON.stringify(map, null, 2));

console.log("[AUTHORITY MAP] COMPLETE");
