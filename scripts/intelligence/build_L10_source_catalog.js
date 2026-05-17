const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L10_COMMUNICATION_INTELLIGENCE.sources.json";

const catalog = {
  version: "nexus_L10_communication_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L10_COMMUNICATION_INTELLIGENCE",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "OFFICIAL_CONTACT_PAGES", authority: "LOCAL", type: "official_contact", coverage: "ENTITY" },
    { source_id: "STAFF_DIRECTORIES", authority: "LOCAL", type: "staff_contact", coverage: "ENTITY" },
    { source_id: "DEPARTMENT_PHONE_DIRECTORIES", authority: "LOCAL", type: "phone_routing", coverage: "ENTITY" },
    { source_id: "NON_EMERGENCY_LINES", authority: "LOCAL", type: "public_safety_routing", coverage: "LOCAL" },
    { source_id: "TRAINING_COORDINATOR_CONTACTS", authority: "LOCAL", type: "training_contact", coverage: "ENTITY" },
    { source_id: "ACADEMY_CONTACT_PAGES", authority: "STATE", type: "academy_contact", coverage: "STATE_REGIONAL" },
    { source_id: "PUBLIC_INFORMATION_OFFICERS", authority: "LOCAL", type: "media_public_contact", coverage: "ENTITY" },
    { source_id: "CITY_SWITCHBOARDS", authority: "LOCAL", type: "fallback_routing", coverage: "LOCAL" },
    { source_id: "COUNTY_SWITCHBOARDS", authority: "LOCAL", type: "fallback_routing", coverage: "COUNTY" },
    { source_id: "PROCUREMENT_CONTACTS", authority: "LOCAL", type: "purchasing_contact", coverage: "LOCAL" },
    { source_id: "PUBLIC_RECORDS_OFFICERS", authority: "LOCAL", type: "records_contact", coverage: "LOCAL" },
    { source_id: "ASSOCIATION_CONTACT_LISTS", authority: "STATE", type: "professional_network_contact", coverage: "STATE" },
    { source_id: "EVENT_CONTACTS", authority: "COMMERCIAL", type: "event_routing", coverage: "REGIONAL_NATIONAL" },
    { source_id: "EMAIL_PATTERN_REFERENCES", authority: "OSINT", type: "email_resolution_support", coverage: "ENTITY" },
    { source_id: "VERIFIED_MANUAL_CONTACTS", authority: "OPERATIONAL", type: "manual_verified_contact", coverage: "ENTITY" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L10 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
