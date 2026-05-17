const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L09_CONTACT_DECISION_MAKER_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L09_SRC_004_TRAINING_COORDINATOR_REFERENCES", "Training Coordinator References", 0.95, "training_coordinator_reference", "training_coordinator_connector", "training_coordinator_parser", "CONTACT_TRAINING_SIGNAL", "training_coordinator_profile", "retain_with_training_coordinator_trace"],
  ["L09_SRC_005_EXECUTIVE_LEADERSHIP_PAGES", "Executive Leadership Pages", 0.94, "executive_leadership_page", "executive_leadership_connector", "executive_leadership_parser", "CONTACT_EXECUTIVE_SIGNAL", "executive_leadership_profile", "retain_with_executive_leadership_trace"],
  ["L09_SRC_006_ADMINISTRATIVE_CONTACTS", "Administrative Contacts", 0.93, "administrative_contact", "administrative_contact_connector", "administrative_contact_parser", "CONTACT_ADMIN_SIGNAL", "administrative_contact_profile", "retain_with_administrative_contact_trace"],
  ["L09_SRC_007_DEPARTMENT_HEAD_LISTINGS", "Department Head Listings", 0.92, "department_head_listing", "department_head_connector", "department_head_parser", "CONTACT_AUTHORITY_SIGNAL", "department_head_profile", "retain_with_department_head_trace"],
  ["L09_SRC_008_VENDOR_REGISTRATION_CONTACTS", "Vendor Registration Contacts", 0.91, "vendor_registration_contact", "vendor_registration_connector", "vendor_registration_parser", "CONTACT_PROCUREMENT_SIGNAL", "vendor_registration_contact_profile", "retain_with_vendor_registration_contact_trace"],
  ["L09_SRC_009_PUBLIC_EMAIL_DIRECTORIES", "Public Email Directories", 0.90, "public_email_directory", "public_email_directory_connector", "public_email_directory_parser", "CONTACT_REACHABILITY_SIGNAL", "public_email_directory_profile", "retain_with_public_email_directory_trace"],
  ["L09_SRC_010_PUBLIC_PHONE_DIRECTORIES", "Public Phone Directories", 0.89, "public_phone_directory", "public_phone_directory_connector", "public_phone_directory_parser", "CONTACT_REACHABILITY_SIGNAL", "public_phone_directory_profile", "retain_with_public_phone_directory_trace"],
  ["L09_SRC_011_LINKED_ROLE_REFERENCES", "Linked Role References", 0.88, "linked_role_reference", "linked_role_connector", "linked_role_parser", "CONTACT_ROLE_FIT_SIGNAL", "linked_role_profile", "retain_with_linked_role_trace"],
  ["L09_SRC_012_BOARD_COMMISSION_ROSTERS", "Board and Commission Rosters", 0.87, "board_commission_roster", "board_commission_connector", "board_commission_parser", "CONTACT_AUTHORITY_SIGNAL", "board_commission_profile", "retain_with_board_commission_trace"],
  ["L09_SRC_013_PUBLIC_MEETING_ATTENDEE_RECORDS", "Public Meeting Attendee Records", 0.86, "public_meeting_attendee_record", "public_meeting_attendee_connector", "public_meeting_attendee_parser", "CONTACT_INFLUENCE_SIGNAL", "public_meeting_attendee_profile", "retain_with_public_meeting_attendee_trace"],
  ["L09_SRC_014_ORG_CHART_REFERENCES", "Organization Chart References", 0.85, "org_chart_reference", "org_chart_connector", "org_chart_parser", "CONTACT_HIERARCHY_SIGNAL", "org_chart_profile", "retain_with_org_chart_trace"],
  ["L09_SRC_015_VERIFIED_OUTREACH_CONTACTS", "Verified Outreach Contacts", 0.84, "verified_outreach_contact", "verified_outreach_connector", "verified_outreach_parser", "CONTACT_VERIFIED_SIGNAL", "verified_outreach_profile", "retain_with_verified_outreach_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L09",
      name,
      authority_score,
      authority: "CONTACT",
      type,
      coverage: "US_CONTACT",
      acquisition_type: "public_contact_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "contact_decision_maker_normalizer",
      lineage_tracking_enabled: true,
      evidence_retention_policy,
      signal_generation_type,
      dossier_contribution_type
    });
  }
}

registry.sources.sort((a, b) => a.source_id.localeCompare(b.source_id));
registry.generated_at = new Date().toISOString();

fs.writeFileSync(abs, JSON.stringify(registry, null, 2), "utf8");

console.log(JSON.stringify({
  status: "L09_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
