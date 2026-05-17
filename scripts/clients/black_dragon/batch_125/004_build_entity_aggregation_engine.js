const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const aggregation = {

  version:
    "black_dragon_entity_aggregation_engine_v1",

  generated_at:
    new Date().toISOString(),

  aggregation_rules: [

    {
      rule_id: "AGGREGATE_MEDIA_NETWORKS",
      enabled: true,
      match_fields: [
        "organization_name",
        "website_domain",
        "social_handle"
      ]
    },

    {
      rule_id: "AGGREGATE_EVENT_NETWORKS",
      enabled: true,
      match_fields: [
        "event_name",
        "event_organizer",
        "event_domain"
      ]
    },

    {
      rule_id: "AGGREGATE_CREATOR_NETWORKS",
      enabled: true,
      match_fields: [
        "creator_name",
        "youtube_channel",
        "podcast_brand"
      ]
    }
  ],

  merge_behavior: {

    preserve_highest_score:
      true,

    preserve_all_roles:
      true,

    preserve_all_layers:
      true,

    preserve_all_contact_routes:
      true,

    preserve_all_historical_signals:
      true
  },

  auto_merge_confidence_threshold:
    0.95,

  low_confidence_requires_review:
    true
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/discovery_queue/entity_aggregation_engine.json"
);

fs.writeFileSync(out, JSON.stringify(aggregation, null, 2));

console.log(JSON.stringify({
  status: "ENTITY_AGGREGATION_ENGINE_COMPLETE",
  aggregation_rules: aggregation.aggregation_rules.length,
  output: out
}, null, 2));
