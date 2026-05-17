const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const lb = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const la = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const sd = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const fedAudit = read(
  "public/data/clients/black_dragon/federation/southern_california/audit/batch_151_southern_california_federation_audit.json"
);

const refinedFeed = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/explainability/refined_client_opportunity_feed.json"
);

const dashboard = {
  version: "black_dragon_client_dashboard_summary_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  dashboard_id: "BD_SOCAL_OPERATIONAL_DASHBOARD",
  dashboard_title: "Southern California Book Sales Intelligence",

  client_visible: true,

  region_summary: {
    region: "Southern California",
    operational_cities: [
      "Long Beach",
      "Los Angeles",
      "San Diego"
    ],
    total_runtime_entities:
      lb.merged_entities.length +
      la.merged_entities.length +
      sd.merged_entities.length,
    federation_entities: fedAudit.counts.total_runtime_entities,
    regional_overlap_entities: fedAudit.counts.overlap_entities,
    refined_client_opportunities: refinedFeed.summary.total_opportunities,
    medium_certainty_opportunities: refinedFeed.summary.medium_certainty,
    review_certainty_opportunities: refinedFeed.summary.review_certainty
  },

  city_cards: [
    {
      city: "Long Beach",
      status: "PRODUCTION_TEMPLATE_CITY",
      runtime_entities: lb.merged_entities.length,
      contact_ready_entities: lb.contact_ready_entities
    },
    {
      city: "Los Angeles",
      status: "OPERATIONAL_CITY",
      runtime_entities: la.merged_entities.length,
      contact_ready_entities: la.contact_ready_entities || 0,
      duplicate_review_entities: la.duplicate_review_entities
    },
    {
      city: "San Diego",
      status: "OPERATIONAL_CITY",
      runtime_entities: sd.merged_entities.length,
      contact_ready_entities: sd.contact_ready_entities || 0,
      duplicate_review_entities: sd.duplicate_review_entities
    }
  ],

  safety_banner: {
    message:
      "This dashboard ranks and explains manual opportunities. It does not send outreach, auto-promote targets, or delete records.",
    auto_contact_enabled: false,
    auto_promotion_enabled: false,
    runtime_mutation_enabled: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/client_access/black_dragon/dashboards/client_dashboard_summary.json"
);

fs.writeFileSync(out, JSON.stringify(dashboard, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BLACK_DRAGON_CLIENT_DASHBOARD_SUMMARY_COMPLETE",
  total_runtime_entities: dashboard.region_summary.total_runtime_entities,
  refined_client_opportunities: dashboard.region_summary.refined_client_opportunities,
  output: out
}, null, 2));
