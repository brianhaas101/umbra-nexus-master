const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const scoring = readJson(
  "public/data/clients/black_dragon/institutional/runtime/institutional_relationship_scoring.v1.json"
);

const index = readJson(
  "public/data/clients/black_dragon/institutional/relationships/institutional_relationship_index.v1.json"
);

const relationships = index.relationships || [];

const audit = {
  version: "umbra_batch_081_institutional_relationship_scoring_audit_v1",
  generated_at: new Date().toISOString(),

  scoring_integrity: {
    relationships: scoring.totals.relationships,
    regions: scoring.totals.regions,
    has_top_relationships: Array.isArray(scoring.top_relationships) && scoring.top_relationships.length > 0,
    has_top_regions: Array.isArray(scoring.top_regions) && scoring.top_regions.length > 0
  },

  relationship_integrity: {
    relationships_present: relationships.length > 0,
    all_have_credibility_score: relationships.every(r => typeof r.credibility_score === "number"),
    all_have_adoption_score: relationships.every(r => typeof r.adoption_likelihood_score === "number"),
    all_have_tiers: relationships.every(r => !!r.relationship_tier),
    all_have_institutional_overlap: relationships.every(r => typeof r.institutional_overlap === "number"),
    all_outreach_blocked: relationships.every(r => r.outreach_allowed === false)
  },

  safety_integrity: {
    outreach_allowed_zero: scoring.totals.outreach_allowed === 0,
    all_verify_first: relationships.every(r => r.next_action.includes("VERIFY"))
  }
};

audit.pass =
  audit.scoring_integrity.relationships > 0 &&
  audit.scoring_integrity.regions > 0 &&
  audit.scoring_integrity.has_top_relationships &&
  audit.scoring_integrity.has_top_regions &&
  audit.relationship_integrity.relationships_present &&
  audit.relationship_integrity.all_have_credibility_score &&
  audit.relationship_integrity.all_have_adoption_score &&
  audit.relationship_integrity.all_have_tiers &&
  audit.relationship_integrity.all_have_institutional_overlap &&
  audit.relationship_integrity.all_outreach_blocked &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.all_verify_first;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/institutional/audit/batch_081_institutional_relationship_scoring_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
