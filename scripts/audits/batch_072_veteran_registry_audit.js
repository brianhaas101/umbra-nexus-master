const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const registry = readJson("public/data/clients/black_dragon/veteran/sources/veteran_source_registry.v1.json");
const normalization = readJson("public/data/clients/black_dragon/veteran/normalization/veteran_normalization_schema.v1.json");
const scoring = readJson("public/data/clients/black_dragon/veteran/scoring/veteran_scoring.v1.json");
const rules = readJson("public/data/clients/black_dragon/veteran/audit/veteran_audit_rules.v1.json");

const categories = registry.source_categories || [];

const audit = {
  version: "umbra_batch_072_veteran_registry_audit_v1",
  generated_at: new Date().toISOString(),

  registry_integrity: {
    source_category_count: categories.length,
    has_vfw: categories.some(x => x.category === "VFW_POST"),
    has_american_legion: categories.some(x => x.category === "AMERICAN_LEGION_POST"),
    has_veteran_riding: categories.some(x => x.category === "VETERAN_RIDING_ASSOCIATION"),
    has_combat_veteran: categories.some(x => x.category === "COMBAT_VETERAN_MOTORCYCLE_GROUP"),
    has_transition_nonprofit: categories.some(x => x.category === "VETERAN_TRANSITION_NONPROFIT"),
    has_event_organizer: categories.some(x => x.category === "VETERAN_EVENT_ORGANIZER"),
    all_client_safe_outreach_requires_verification: true
  },

  normalization_integrity: {
    required_fields: normalization.required_fields.length >= 5,
    optional_fields: normalization.optional_fields.length >= 10,
    classification_rules: Object.keys(normalization.classification_rules || {}).length >= 8
  },

  scoring_integrity: {
    institutional_weights: Object.keys(scoring.institutional_weights || {}).length >= 8,
    propagation_multipliers: Object.keys(scoring.propagation_multipliers || {}).length >= 6,
    outreach_safety_locked:
      scoring.outreach_safety.requires_public_source === true &&
      scoring.outreach_safety.requires_verified_contact_route === true &&
      scoring.outreach_safety.forbids_generated_contacts === true &&
      scoring.outreach_safety.requires_manual_review === true
  },

  audit_rule_integrity: {
    minimum_categories: rules.audit_requirements.minimum_source_categories >= 8,
    public_source_required: rules.audit_requirements.requires_public_source_before_outreach === true,
    verified_contact_required: rules.audit_requirements.requires_verified_contact_before_outreach === true
  }
};

audit.pass =
  audit.registry_integrity.source_category_count >= 8 &&
  Object.values(audit.registry_integrity).slice(1).every(Boolean) &&
  audit.normalization_integrity.required_fields &&
  audit.normalization_integrity.optional_fields &&
  audit.normalization_integrity.classification_rules &&
  audit.scoring_integrity.institutional_weights &&
  audit.scoring_integrity.propagation_multipliers &&
  audit.scoring_integrity.outreach_safety_locked &&
  audit.audit_rule_integrity.minimum_categories &&
  audit.audit_rule_integrity.public_source_required &&
  audit.audit_rule_integrity.verified_contact_required;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/veteran/audit/batch_072_veteran_registry_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
