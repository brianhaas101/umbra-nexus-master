const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const roots = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/roots/multi_city_propagation_roots.json"
);

const chains = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/chains/corridor_propagation_chains.json"
);

const roles = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/roles/propagation_role_registry.json"
);

const roleMap = new Map(
  roles.roles.map(r => [
    `${r.organization_name.toLowerCase().trim()}::${r.city}`,
    r
  ])
);

const opportunities = chains.chains
  .sort((a, b) => b.regional_score - a.regional_score)
  .slice(0, 25)
  .map((chain, index) => {
    const role =
      roleMap.get(`${chain.root_organization.toLowerCase().trim()}::${chain.root_city}`);

    return {
      opportunity_id:
        `BD_SOCAL_OPPORTUNITY_${String(index + 1).padStart(5, "0")}`,

      root_organization:
        chain.root_organization,

      root_city:
        chain.root_city,

      participating_cities:
        chain.participating_cities,

      city_span:
        chain.city_span,

      regional_score:
        chain.regional_score,

      chain_strength:
        chain.chain_strength,

      propagation_role:
        role?.propagation_role || "UNKNOWN_ROLE",

      likely_value:
        role?.likely_value || "requires review",

      recommended_strategy:
        chain.recommended_strategy,

      client_action_label:
        chain.city_span >= 2
          ? "Review as a regional opportunity before manual action."
          : "Review as a city-level opportunity before manual action.",

      manual_review_required:
        true,

      automated_outreach_allowed:
        false,

      contact_ready_promotion_allowed:
        false,

      runtime_mutation_allowed:
        false
    };
  });

const feed = {
  version:
    "black_dragon_southern_california_client_corridor_opportunity_feed_v1",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon_omg_cert_v1",

  corridor:
    "SOUTHERN_CALIFORNIA",

  feed_title:
    "Southern California Corridor Propagation Opportunities",

  client_visible:
    true,

  summary: {
    propagation_roots:
      roots.root_count,

    propagation_chains:
      chains.chain_count,

    client_opportunities:
      opportunities.length,

    regional_opportunities:
      opportunities.filter(o => o.city_span >= 2).length,

    city_level_opportunities:
      opportunities.filter(o => o.city_span === 1).length
  },

  opportunities,

  safety_locks: {
    feed_can_recommend:
      true,

    feed_can_auto_contact:
      false,

    feed_can_auto_promote:
      false,

    feed_can_mutate_runtime:
      false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/propagation/client_feed/corridor_opportunity_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CLIENT_CORRIDOR_OPPORTUNITY_FEED_COMPLETE",
  summary: feed.summary,
  output: out
}, null, 2));
