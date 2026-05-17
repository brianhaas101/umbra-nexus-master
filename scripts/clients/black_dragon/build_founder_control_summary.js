const fs = require("fs");

const OUT = "public/data/clients/black_dragon/founder_control_summary.json";

const summary = {
  version: "black_dragon_founder_control_summary_v1",
  generated_at: new Date().toISOString(),
  founder_rules: {
    client_cannot_modify_source_truth: true,
    client_cannot_promote_unverified_contacts: true,
    client_cannot_access_raw_parser_controls: true,
    client_visible_outputs_are_derived_only: true,
    founder_retains_registry_and_pipeline_authority: true
  },
  controlled_files: [
    "black_dragon_50_state_source_registry.json",
    "manual_verified_contacts.json",
    "state_candidates/ca_verified_contacts.json",
    "national_verified_outreach_shortlist.json",
    "normalized_intelligence_outputs.json",
    "dossier_targets.json",
    "black_dragon_client_sync.json"
  ],
  founder_only_scripts: [
    "append_manual_verified_contact.js",
    "append_ca_verified_contact.js",
    "run_verified_state_parsers.js",
    "ca_post_agency_connector.js",
    "run_black_dragon_master_build.js"
  ],
  operational_boundary: "Client receives derived operational intelligence. Founder controls verification, source authority, and pipeline promotion."
};

fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
console.log("[FOUNDER CONTROL] COMPLETE");
