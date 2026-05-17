const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const originalFeed = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/client_feed/corridor_opportunity_feed.json"
);

const certainty = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/certainty/propagation_certainty_model.json"
);

const certaintyMap = new Map(
  certainty.certainty.map(row => [
    `${row.root_organization.toLowerCase().trim()}::${row.root_city}`,
    row
  ])
);

const opportunities = originalFeed.opportunities.map(item => {
  const cert =
    certaintyMap.get(`${item.root_organization.toLowerCase().trim()}::${item.root_city}`);

  return {
    ...item,

    certainty_score:
      cert ? cert.certainty_score : null,

    certainty_band:
      cert ? cert.certainty_band : "UNSCORED_CERTAINTY",

    refined_recommended_action:
      cert ? cert.recommended_action : "HOLD_FOR_ADDITIONAL_SIGNAL",

    refined_client_action_label:
      cert && cert.certainty_score >= 0.8
        ? "High-certainty corridor opportunity. Review manually before action."
        : cert && cert.certainty_score >= 0.6
          ? "Medium-certainty opportunity. Review after high-certainty targets."
          : "Hold until stronger signals are available.",

    automated_outreach_allowed:
      false,

    contact_ready_promotion_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
})
.sort((a, b) => {
  const ac = a.certainty_score || 0;
  const bc = b.certainty_score || 0;
  if (bc !== ac) return bc - ac;
  return b.regional_score - a.regional_score;
});

const feed = {
  version:
    "black_dragon_southern_california_refined_client_opportunity_feed_v1",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon_omg_cert_v1",

  corridor:
    "SOUTHERN_CALIFORNIA",

  client_visible:
    true,

  summary: {
    total_opportunities:
      opportunities.length,

    high_certainty:
      opportunities.filter(o => o.certainty_band === "HIGH_CERTAINTY").length,

    medium_certainty:
      opportunities.filter(o => o.certainty_band === "MEDIUM_CERTAINTY").length,

    review_certainty:
      opportunities.filter(o => o.certainty_band === "REVIEW_CERTAINTY").length
  },

  opportunities,

  safety_locks: {
    feed_can_recommend: true,
    feed_can_auto_contact: false,
    feed_can_auto_promote: false,
    feed_can_mutate_runtime: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/refinement/explainability/refined_client_opportunity_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "REFINED_CLIENT_OPPORTUNITY_FEED_COMPLETE",
  summary: feed.summary,
  output: out
}, null, 2));
