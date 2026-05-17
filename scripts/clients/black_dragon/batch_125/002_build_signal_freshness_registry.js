const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const freshness = {

  version:
    "black_dragon_signal_freshness_registry_v1",

  generated_at:
    new Date().toISOString(),

  freshness_policies: [

    {
      signal_type: "EVENT",
      stale_after_days: 30,
      decay_multiplier: 0.75,
      rerank_required: true
    },

    {
      signal_type: "PODCAST",
      stale_after_days: 60,
      decay_multiplier: 0.85,
      rerank_required: true
    },

    {
      signal_type: "YOUTUBE_CHANNEL",
      stale_after_days: 45,
      decay_multiplier: 0.85,
      rerank_required: true
    },

    {
      signal_type: "MEDIA_PUBLICATION",
      stale_after_days: 90,
      decay_multiplier: 0.90,
      rerank_required: true
    },

    {
      signal_type: "DEALERSHIP",
      stale_after_days: 120,
      decay_multiplier: 0.95,
      rerank_required: false
    },

    {
      signal_type: "CLUB_ASSOCIATION",
      stale_after_days: 120,
      decay_multiplier: 0.92,
      rerank_required: false
    },

    {
      signal_type: "CONTACT_ROUTE",
      stale_after_days: 45,
      decay_multiplier: 0.80,
      rerank_required: true
    }
  ],

  freshness_tracking_fields: [

    "first_seen_at",
    "last_seen_at",
    "last_verified_at",
    "signal_age_days",
    "stale_status",
    "decay_multiplier",
    "freshness_score"
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/freshness/signal_freshness_registry.json"
);

fs.writeFileSync(out, JSON.stringify(freshness, null, 2));

console.log(JSON.stringify({
  status: "SIGNAL_FRESHNESS_ENGINE_COMPLETE",
  freshness_policies: freshness.freshness_policies.length,
  output: out
}, null, 2));
