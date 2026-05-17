const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L08_COMMAND_STRUCTURE.sources.json";

const catalog = {
  version: "nexus_L08_command_structure_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L08_COMMAND_STRUCTURE",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "OFFICIAL_ORG_CHARTS", authority: "LOCAL", type: "org_chart", coverage: "ENTITY" },
    { source_id: "COMMAND_STAFF_PAGES", authority: "LOCAL", type: "leadership_directory", coverage: "ENTITY" },
    { source_id: "STAFF_DIRECTORIES", authority: "LOCAL", type: "staff_directory", coverage: "ENTITY" },
    { source_id: "LEADERSHIP_BIOS", authority: "LOCAL", type: "leadership_profile", coverage: "ENTITY" },
    { source_id: "PROMOTION_ANNOUNCEMENTS", authority: "LOCAL", type: "leadership_change", coverage: "ENTITY" },
    { source_id: "CITY_MANAGER_RECORDS", authority: "LOCAL", type: "executive_oversight", coverage: "LOCAL" },
    { source_id: "COUNCIL_MEETING_MINUTES", authority: "LOCAL", type: "decision_record", coverage: "LOCAL" },
    { source_id: "PROCUREMENT_SIGNATORY_RECORDS", authority: "LOCAL", type: "approval_authority", coverage: "LOCAL" },
    { source_id: "TRAINING_COMMAND_LISTINGS", authority: "LOCAL", type: "training_authority", coverage: "ENTITY" },
    { source_id: "ACADEMY_COMMAND_LISTINGS", authority: "STATE", type: "academy_authority", coverage: "STATE_REGIONAL" },
    { source_id: "STATE_ASSOCIATION_ROSTERS", authority: "STATE", type: "professional_influence", coverage: "STATE" },
    { source_id: "CONFERENCE_SPEAKER_LISTS", authority: "COMMERCIAL", type: "public_authority_signal", coverage: "REGIONAL_NATIONAL" },
    { source_id: "ADVISORY_BOARD_RECORDS", authority: "STATE", type: "policy_influence", coverage: "STATE" },
    { source_id: "OVERSIGHT_COMMITTEE_RECORDS", authority: "LOCAL", type: "oversight_authority", coverage: "LOCAL" },
    { source_id: "PUBLIC_CONTACT_ROUTING_RECORDS", authority: "LOCAL", type: "routing_authority", coverage: "ENTITY" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L08 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
