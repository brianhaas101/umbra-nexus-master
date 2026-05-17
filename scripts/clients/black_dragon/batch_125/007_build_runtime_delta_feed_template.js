const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const delta_feed = {

  version:
    "black_dragon_runtime_delta_feed_template_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  feed_template: {

    new_hot_targets: [],
    new_warm_targets: [],
    rising_targets: [],
    stale_targets: [],
    broken_contact_routes: [],
    new_events: [],
    new_podcasts: [],
    new_youtube_channels: [],
    new_influencer_networks: [],
    newly_verified_routes: []
  },

  client_visible:
    true,

  automated_contact_allowed:
    false
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/runtime_delta/runtime_delta_feed_template.json"
);

fs.writeFileSync(out, JSON.stringify(delta_feed, null, 2));

console.log(JSON.stringify({
  status: "RUNTIME_DELTA_FEED_TEMPLATE_COMPLETE",
  output: out
}, null, 2));
