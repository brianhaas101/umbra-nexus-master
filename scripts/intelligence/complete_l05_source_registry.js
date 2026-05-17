const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L05_BEHAVIORAL_DEMAND_SIGNAL_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L05_SRC_004_WEBSITE_CHANGE_SIGNALS", "Website Change Signals", 0.95, "website_change_signal", "website_change_connector", "website_change_parser", "BEHAVIORAL_ACTIVITY_SIGNAL", "website_change_profile", "retain_with_website_change_trace"],
  ["L05_SRC_005_JOB_POSTING_BEHAVIOR", "Job Posting Behavior", 0.94, "job_posting_behavior", "job_posting_behavior_connector", "job_posting_behavior_parser", "BEHAVIORAL_STAFFING_SIGNAL", "job_posting_behavior_profile", "retain_with_job_posting_trace"],
  ["L05_SRC_006_EVENT_ATTENDANCE_SIGNALS", "Event Attendance Signals", 0.93, "event_attendance_signal", "event_attendance_connector", "event_attendance_parser", "BEHAVIORAL_EVENT_SIGNAL", "event_attendance_profile", "retain_with_event_attendance_trace"],
  ["L05_SRC_007_TRAINING_INTEREST_SIGNALS", "Training Interest Signals", 0.92, "training_interest_signal", "training_interest_connector", "training_interest_parser", "BEHAVIORAL_TRAINING_SIGNAL", "training_interest_profile", "retain_with_training_interest_trace"],
  ["L05_SRC_008_PROCUREMENT_INTENT_SIGNALS", "Procurement Intent Signals", 0.91, "procurement_intent_signal", "procurement_intent_connector", "procurement_intent_parser", "BEHAVIORAL_PROCUREMENT_SIGNAL", "procurement_intent_profile", "retain_with_procurement_intent_trace"],
  ["L05_SRC_009_PUBLIC_COMPLAINT_SIGNALS", "Public Complaint Signals", 0.90, "public_complaint_signal", "public_complaint_connector", "public_complaint_parser", "BEHAVIORAL_PRESSURE_SIGNAL", "public_complaint_profile", "retain_with_public_complaint_trace"],
  ["L05_SRC_010_COMMUNITY_PRESSURE_SIGNALS", "Community Pressure Signals", 0.89, "community_pressure_signal", "community_pressure_connector", "community_pressure_parser", "BEHAVIORAL_PRESSURE_SIGNAL", "community_pressure_profile", "retain_with_community_pressure_trace"],
  ["L05_SRC_011_NEWS_MENTION_ACTIVITY", "News Mention Activity", 0.88, "news_mention_activity", "news_mention_connector", "news_mention_parser", "BEHAVIORAL_ATTENTION_SIGNAL", "news_mention_profile", "retain_with_news_mention_trace"],
  ["L05_SRC_012_FORUM_DISCUSSION_SIGNALS", "Forum Discussion Signals", 0.87, "forum_discussion_signal", "forum_discussion_connector", "forum_discussion_parser", "BEHAVIORAL_DISCUSSION_SIGNAL", "forum_discussion_profile", "retain_with_forum_discussion_trace"],
  ["L05_SRC_013_VENDOR_RESEARCH_SIGNALS", "Vendor Research Signals", 0.86, "vendor_research_signal", "vendor_research_connector", "vendor_research_parser", "BEHAVIORAL_VENDOR_SIGNAL", "vendor_research_profile", "retain_with_vendor_research_trace"],
  ["L05_SRC_014_POLICY_REACTION_SIGNALS", "Policy Reaction Signals", 0.85, "policy_reaction_signal", "policy_reaction_connector", "policy_reaction_parser", "BEHAVIORAL_POLICY_SIGNAL", "policy_reaction_profile", "retain_with_policy_reaction_trace"],
  ["L05_SRC_015_DEMAND_SURGE_INDICATORS", "Demand Surge Indicators", 0.84, "demand_surge_indicator", "demand_surge_connector", "demand_surge_parser", "BEHAVIORAL_DEMAND_SIGNAL", "demand_surge_profile", "retain_with_demand_surge_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L05",
      name,
      authority_score,
      authority: "BEHAVIORAL",
      type,
      coverage: "US_BEHAVIORAL",
      acquisition_type: "public_behavioral_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "behavioral_demand_normalizer",
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
  status: "L05_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
