const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L10_COMMUNICATION_OUTREACH_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L10_SRC_004_WEBSITE_CONTACT_PAGES", "Website Contact Pages", 0.95, "website_contact_page", "website_contact_page_connector", "website_contact_page_parser", "COMMUNICATION_WEB_SIGNAL", "website_contact_profile", "retain_with_website_contact_trace"],
  ["L10_SRC_005_SOCIAL_MEDIA_CHANNELS", "Social Media Channels", 0.94, "social_media_channel", "social_media_channel_connector", "social_media_channel_parser", "COMMUNICATION_SOCIAL_SIGNAL", "social_media_channel_profile", "retain_with_social_media_trace"],
  ["L10_SRC_006_NEWSLETTER_SIGNUP_ENDPOINTS", "Newsletter Signup Endpoints", 0.93, "newsletter_signup_endpoint", "newsletter_signup_connector", "newsletter_signup_parser", "COMMUNICATION_OPTIN_SIGNAL", "newsletter_signup_profile", "retain_with_newsletter_signup_trace"],
  ["L10_SRC_007_PUBLIC_HELPDESK_CHANNELS", "Public Helpdesk Channels", 0.92, "public_helpdesk_channel", "public_helpdesk_connector", "public_helpdesk_parser", "COMMUNICATION_HELPDESK_SIGNAL", "public_helpdesk_profile", "retain_with_public_helpdesk_trace"],
  ["L10_SRC_008_DEPARTMENT_INBOXES", "Department Inboxes", 0.91, "department_inbox", "department_inbox_connector", "department_inbox_parser", "COMMUNICATION_EMAIL_SIGNAL", "department_inbox_profile", "retain_with_department_inbox_trace"],
  ["L10_SRC_009_PROCUREMENT_INBOXES", "Procurement Inboxes", 0.90, "procurement_inbox", "procurement_inbox_connector", "procurement_inbox_parser", "COMMUNICATION_PROCUREMENT_SIGNAL", "procurement_inbox_profile", "retain_with_procurement_inbox_trace"],
  ["L10_SRC_010_TRAINING_INBOXES", "Training Inboxes", 0.89, "training_inbox", "training_inbox_connector", "training_inbox_parser", "COMMUNICATION_TRAINING_SIGNAL", "training_inbox_profile", "retain_with_training_inbox_trace"],
  ["L10_SRC_011_MEDIA_RELATIONS_CHANNELS", "Media Relations Channels", 0.88, "media_relations_channel", "media_relations_connector", "media_relations_parser", "COMMUNICATION_MEDIA_SIGNAL", "media_relations_profile", "retain_with_media_relations_trace"],
  ["L10_SRC_012_PUBLIC_CALENDAR_CHANNELS", "Public Calendar Channels", 0.87, "public_calendar_channel", "public_calendar_connector", "public_calendar_parser", "COMMUNICATION_CALENDAR_SIGNAL", "public_calendar_profile", "retain_with_public_calendar_trace"],
  ["L10_SRC_013_EVENT_REGISTRATION_CHANNELS", "Event Registration Channels", 0.86, "event_registration_channel", "event_registration_connector", "event_registration_parser", "COMMUNICATION_EVENT_SIGNAL", "event_registration_profile", "retain_with_event_registration_trace"],
  ["L10_SRC_014_OUTREACH_RESPONSE_REFERENCES", "Outreach Response References", 0.85, "outreach_response_reference", "outreach_response_connector", "outreach_response_parser", "COMMUNICATION_RESPONSE_SIGNAL", "outreach_response_profile", "retain_with_outreach_response_trace"],
  ["L10_SRC_015_CHANNEL_QUALITY_INDICATORS", "Channel Quality Indicators", 0.84, "channel_quality_indicator", "channel_quality_connector", "channel_quality_parser", "COMMUNICATION_QUALITY_SIGNAL", "channel_quality_profile", "retain_with_channel_quality_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L10",
      name,
      authority_score,
      authority: "COMMUNICATION",
      type,
      coverage: "US_COMMUNICATION",
      acquisition_type: "public_communication_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "communication_outreach_normalizer",
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
  status: "L10_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
