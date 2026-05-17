const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

const feed = {
  version: "black_dragon_long_beach_client_propagation_feed_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  city: "Long Beach",
  state: "CA",

  feed_id: "BD_LB_CLIENT_PROPAGATION_FEED",
  feed_title: "Long Beach Propagation Opportunities",
  client_visible: true,

  feed_summary: {
    total_paths: paths.total_paths,
    direct_manual_action_paths:
      paths.paths.filter(p =>
        p.recommended_use === "DIRECT_MANUAL_ACTION_PLUS_PROPAGATION"
      ).length,
    review_before_action_paths:
      paths.paths.filter(p =>
        p.recommended_use === "PROPAGATION_REVIEW_BEFORE_ACTION"
      ).length
  },

  propagation_opportunities:
    paths.paths.map(p => ({
      propagation_path_id:
        p.propagation_path_id,

      root_organization:
        p.root_organization,

      root_influence_score:
        p.root_influence_score,

      recommended_use:
        p.recommended_use,

      connected_target_count:
        p.connected_targets.length,

      top_connected_targets:
        p.connected_targets.slice(0, 5),

      client_action_label:
        p.recommended_use === "DIRECT_MANUAL_ACTION_PLUS_PROPAGATION"
          ? "Manual contact route exists. Review connected propagation opportunities."
          : "Review influence value and validate contact route before action.",

      automated_outreach_allowed:
        false,

      runtime_mutation_allowed:
        false
    })),

  safety_locks: {
    feed_can_recommend: true,
    feed_can_auto_contact: false,
    feed_can_auto_promote: false,
    feed_can_delete_targets: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/ui/client_feed/client_propagation_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CLIENT_PROPAGATION_FEED_COMPLETE",
  total_paths: feed.feed_summary.total_paths,
  output: out
}, null, 2));
