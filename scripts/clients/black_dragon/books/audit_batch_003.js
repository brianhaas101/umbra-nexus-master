const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_normalized.v1.json"
);

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

const audit = {
  version: "black_dragon_books_batch_003_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: targets.length,
    tier_1: targets.filter(t => t.country_tier === "TIER_1").length,
    tier_2: targets.filter(t => t.country_tier === "TIER_2").length,
    unknown_leaders: targets.filter(t => t.target_name === "UNKNOWN_LEADER").length,
    unknown_roles: targets.filter(t => t.leader_role === "UNKNOWN").length
  },

  organization_types: targets.reduce((acc, t) => {
    acc[t.organization_type] = (acc[t.organization_type] || 0) + 1;
    return acc;
  }, {}),

  integrity: {
    missing_entity_id: targets.filter(t => !t.entity_id).length,
    missing_organization_name: targets.filter(t => !t.organization_name).length,
    missing_organization_type: targets.filter(t => !t.organization_type).length,
    missing_country_tier: targets.filter(t => !t.country_tier).length,
    missing_why_target: targets.filter(t => !Array.isArray(t.why_target) || t.why_target.length < 2).length,
    invalid_status: targets.filter(t => t.outreach_status !== "NOT_CONTACTED").length
  },

  pass: (
    targets.length > 0 &&
    targets.filter(t => !t.entity_id).length === 0 &&
    targets.filter(t => !t.organization_name).length === 0 &&
    targets.filter(t => !t.organization_type).length === 0 &&
    targets.filter(t => !t.country_tier).length === 0 &&
    targets.filter(t => !Array.isArray(t.why_target) || t.why_target.length < 2).length === 0
  )
};

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_003_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
