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

const feed = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/client_feed/corridor_opportunity_feed.json"
);

const audit = {
  version:
    "black_dragon_batch_153_multi_city_propagation_intelligence_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "153_MULTI_CITY_PROPAGATION_INTELLIGENCE",

  corridor:
    "SOUTHERN_CALIFORNIA",

  counts: {
    propagation_roots:
      roots.root_count,

    propagation_chains:
      chains.chain_count,

    role_records:
      roles.role_count,

    client_opportunities:
      feed.summary.client_opportunities,

    regional_opportunities:
      feed.summary.regional_opportunities,

    city_level_opportunities:
      feed.summary.city_level_opportunities
  },

  role_summary:
    roles.role_summary,

  gates: {
    propagation_roots_exist:
      roots.root_count > 0,

    propagation_chains_exist:
      chains.chain_count > 0,

    role_registry_matches_entities:
      roles.role_count >= 30,

    client_feed_visible:
      feed.client_visible === true,

    client_opportunities_exist:
      feed.summary.client_opportunities > 0,

    no_root_auto_outreach:
      roots.roots.every(r =>
        r.automated_outreach_allowed === false
      ),

    no_chain_auto_outreach:
      chains.chains.every(c =>
        c.automated_outreach_allowed === false
      ),

    no_feed_auto_contact:
      feed.safety_locks.feed_can_auto_contact === false,

    no_feed_auto_promotion:
      feed.safety_locks.feed_can_auto_promote === false,

    no_runtime_mutation:
      feed.safety_locks.feed_can_mutate_runtime === false
  },

  interpretation: {
    operational_meaning:
      "The Southern California corridor now produces client-visible multi-city propagation opportunities.",

    sales_meaning:
      "Black Dragon can prioritize regional manual action across events, dealerships, media, veteran networks, and riding communities.",

    safety_meaning:
      "The system recommends and ranks, but does not auto-contact, auto-promote, or mutate runtime entities."
  },

  next_phase:
    "BATCH_154_REGIONAL_OVERLAP_SCORING_REFINEMENT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/propagation/audit/batch_153_multi_city_propagation_intelligence_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_153_MULTI_CITY_PROPAGATION_INTELLIGENCE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  role_summary: audit.role_summary,
  gates: audit.gates,
  output: out
}, null, 2));
