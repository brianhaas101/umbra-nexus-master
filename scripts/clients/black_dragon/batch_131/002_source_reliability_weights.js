const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const weights = {
  version:
    "black_dragon_source_reliability_weights_v1",

  generated_at:
    new Date().toISOString(),

  weights: [

    {
      source_type: "DEALER_DIRECTORY",
      reliability_weight: 0.95
    },

    {
      source_type: "VETERAN_MC_NETWORK",
      reliability_weight: 0.93
    },

    {
      source_type: "EVENT_CALENDAR",
      reliability_weight: 0.91
    },

    {
      source_type: "PUBLICATION_NETWORK",
      reliability_weight: 0.89
    },

    {
      source_type: "CREATOR_NETWORK",
      reliability_weight: 0.84
    },

    {
      source_type: "COMMUNITY_DISCUSSION_NETWORK",
      reliability_weight: 0.76
    },

    {
      source_type: "COMMUNITY_CHAT_NETWORK",
      reliability_weight: 0.72
    },

    {
      source_type: "SHORTFORM_CREATOR_DISCOVERY",
      reliability_weight: 0.69
    }
  ],

  weighting_rules: {
    higher_weight_sources_rank_higher: true,
    stale_sources_decay: true,
    dead_routes_penalized: true,
    duplicate_sources_merge_confidence: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/database_expansion/weights/source_reliability_weights.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(weights, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "SOURCE_RELIABILITY_WEIGHTS_COMPLETE",

  total_weights:
    weights.weights.length,

  output:
    out
}, null, 2));
