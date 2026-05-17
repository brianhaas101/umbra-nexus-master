const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L04_TRAINING_INFRASTRUCTURE.sources.json";

const catalog = {
  version: "nexus_L04_training_infrastructure_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L04_TRAINING_INFRASTRUCTURE",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "STATE_POST_TRAINING_CATALOGS", authority: "STATE", type: "certification_training", coverage: "STATE" },
    { source_id: "REGIONAL_POLICE_ACADEMIES", authority: "STATE", type: "academy_network", coverage: "REGIONAL" },
    { source_id: "LOCAL_TRAINING_DIVISIONS", authority: "LOCAL", type: "agency_training", coverage: "LOCAL" },
    { source_id: "FIELD_TRAINING_PROGRAMS", authority: "LOCAL", type: "field_training", coverage: "LOCAL" },
    { source_id: "CONTINUING_EDUCATION_REQUIREMENTS", authority: "STATE", type: "mandated_training", coverage: "STATE" },
    { source_id: "INSTRUCTOR_REGISTRIES", authority: "STATE", type: "instructor_authority", coverage: "STATE" },
    { source_id: "TRAINING_CALENDARS", authority: "STATE", type: "training_schedule", coverage: "STATE_REGIONAL" },
    { source_id: "PUBLIC_SAFETY_CONFERENCES", authority: "COMMERCIAL", type: "conference_training", coverage: "REGIONAL_NATIONAL" },
    { source_id: "TACTICAL_TRAINING_NETWORKS", authority: "COMMERCIAL", type: "specialized_training", coverage: "REGIONAL_NATIONAL" },
    { source_id: "FEDERAL_TRAINING_PROGRAMS", authority: "FEDERAL", type: "federal_training", coverage: "US_NATIONAL" },
    { source_id: "GRANT_FUNDED_TRAINING_PROGRAMS", authority: "FEDERAL", type: "funded_training", coverage: "US_NATIONAL" },
    { source_id: "UNIVERSITY_CRIMINAL_JUSTICE_PROGRAMS", authority: "ACADEMIC", type: "education_pipeline", coverage: "REGIONAL" },
    { source_id: "ACCREDITATION_STANDARDS", authority: "STATE", type: "training_compliance", coverage: "STATE" },
    { source_id: "VENDOR_TRAINING_LISTINGS", authority: "COMMERCIAL", type: "vendor_training_market", coverage: "REGIONAL_NATIONAL" },
    { source_id: "AGENCY_TRAINING_BULLETINS", authority: "LOCAL", type: "training_activity", coverage: "LOCAL" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L04 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
