const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const refinedFeed = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/explainability/refined_client_opportunity_feed.json"
);

const clientFeed = {
  version: "black_dragon_client_safe_opportunity_feed_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  feed_id: "BD_CLIENT_SOCAL_REFINED_OPPORTUNITIES",
  feed_title: "Southern California Manual Opportunity Feed",

  client_visible: true,

  summary: refinedFeed.summary,

  opportunities:
    refinedFeed.opportunities.map((item, index) => ({
      client_feed_rank: index + 1,

      root_organization: item.root_organization,
      root_city: item.root_city,
      city_span: item.city_span,

      certainty_score: item.certainty_score,
      certainty_band: item.certainty_band,

      propagation_role: item.propagation_role,
      likely_value: item.likely_value,

      refined_recommended_action: item.refined_recommended_action,
      refined_client_action_label: item.refined_client_action_label,

      manual_review_required: true,
      automated_outreach_allowed: false,
      contact_ready_promotion_allowed: false,
      runtime_mutation_allowed: false
    })),

  safety_locks: {
    feed_can_recommend: true,
    feed_can_auto_contact: false,
    feed_can_auto_promote: false,
    feed_can_mutate_runtime: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/client_access/black_dragon/feeds/client_opportunity_feed.json"
);

fs.writeFileSync(out, JSON.stringify(clientFeed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BLACK_DRAGON_CLIENT_OPPORTUNITY_FEED_COMPLETE",
  opportunities: clientFeed.opportunities.length,
  output: out
}, null, 2));
