const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L12_ENGAGEMENT_RESPONSE_CONVERSION_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L12_SRC_004_DEMO_REQUEST_SIGNALS", "Demo Request Signals", 0.95, "demo_request_signal", "demo_request_connector", "demo_request_parser", "ENGAGEMENT_DEMO_SIGNAL", "demo_request_profile", "retain_with_demo_request_trace"],
  ["L12_SRC_005_FORM_SUBMISSION_SIGNALS", "Form Submission Signals", 0.94, "form_submission_signal", "form_submission_connector", "form_submission_parser", "ENGAGEMENT_FORM_SIGNAL", "form_submission_profile", "retain_with_form_submission_trace"],
  ["L12_SRC_006_REPLY_SENTIMENT_SIGNALS", "Reply Sentiment Signals", 0.93, "reply_sentiment_signal", "reply_sentiment_connector", "reply_sentiment_parser", "ENGAGEMENT_SENTIMENT_SIGNAL", "reply_sentiment_profile", "retain_with_reply_sentiment_trace"],
  ["L12_SRC_007_FOLLOW_UP_ACTIVITY", "Follow-Up Activity", 0.92, "follow_up_activity", "follow_up_connector", "follow_up_parser", "ENGAGEMENT_FOLLOWUP_SIGNAL", "follow_up_profile", "retain_with_follow_up_trace"],
  ["L12_SRC_008_CAMPAIGN_TOUCHPOINT_RECORDS", "Campaign Touchpoint Records", 0.91, "campaign_touchpoint_record", "campaign_touchpoint_connector", "campaign_touchpoint_parser", "ENGAGEMENT_TOUCHPOINT_SIGNAL", "campaign_touchpoint_profile", "retain_with_campaign_touchpoint_trace"],
  ["L12_SRC_009_OPEN_CLICK_ACTIVITY", "Open and Click Activity", 0.90, "open_click_activity", "open_click_connector", "open_click_parser", "ENGAGEMENT_INTERACTION_SIGNAL", "open_click_profile", "retain_with_open_click_trace"],
  ["L12_SRC_010_OBJECTION_RESPONSE_RECORDS", "Objection Response Records", 0.89, "objection_response_record", "objection_response_connector", "objection_response_parser", "ENGAGEMENT_OBJECTION_SIGNAL", "objection_response_profile", "retain_with_objection_response_trace"],
  ["L12_SRC_011_PROPOSAL_REQUEST_SIGNALS", "Proposal Request Signals", 0.88, "proposal_request_signal", "proposal_request_connector", "proposal_request_parser", "ENGAGEMENT_PROPOSAL_SIGNAL", "proposal_request_profile", "retain_with_proposal_request_trace"],
  ["L12_SRC_012_PURCHASE_INTENT_SIGNALS", "Purchase Intent Signals", 0.87, "purchase_intent_signal", "purchase_intent_connector", "purchase_intent_parser", "ENGAGEMENT_PURCHASE_INTENT_SIGNAL", "purchase_intent_profile", "retain_with_purchase_intent_trace"],
  ["L12_SRC_013_CONVERSATION_STAGE_RECORDS", "Conversation Stage Records", 0.86, "conversation_stage_record", "conversation_stage_connector", "conversation_stage_parser", "ENGAGEMENT_STAGE_SIGNAL", "conversation_stage_profile", "retain_with_conversation_stage_trace"],
  ["L12_SRC_014_RELATIONSHIP_MOMENTUM_SIGNALS", "Relationship Momentum Signals", 0.85, "relationship_momentum_signal", "relationship_momentum_connector", "relationship_momentum_parser", "ENGAGEMENT_MOMENTUM_SIGNAL", "relationship_momentum_profile", "retain_with_relationship_momentum_trace"],
  ["L12_SRC_015_CONVERSION_OUTCOME_RECORDS", "Conversion Outcome Records", 0.84, "conversion_outcome_record", "conversion_outcome_connector", "conversion_outcome_parser", "ENGAGEMENT_CONVERSION_SIGNAL", "conversion_outcome_profile", "retain_with_conversion_outcome_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L12",
      name,
      authority_score,
      authority: "ENGAGEMENT",
      type,
      coverage: "US_ENGAGEMENT",
      acquisition_type: "engagement_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "engagement_response_normalizer",
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
  status: "L12_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
