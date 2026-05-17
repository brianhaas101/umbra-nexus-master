const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const registry = readJson("public/data/clients/black_dragon/motor_units/sources/motor_unit_source_registry.v1.json");
const normalization = readJson("public/data/clients/black_dragon/motor_units/normalization/motor_unit_normalization_schema.v1.json");
const scoring = readJson("public/data/clients/black_dragon/motor_units/scoring/motor_unit_scoring.v1.json");
const rules = readJson("public/data/clients/black_dragon/motor_units/audit/motor_unit_audit_rules.v1.json");

const categories = registry.source_categories || [];

const audit = {
  version: "umbra_batch_073_motor_unit_registry_audit_v1",
  generated_at: new Date().toISOString(),

  registry_integrity: {
    source_category_count: categories.length,
    has_police_motor_unit: categories.some(x => x.category === "POLICE_MOTOR_UNIT"),
    has_sheriff_motor_division: categories.some(x => x.category === "SHERIFF_MOTOR_DIVISION"),
    has_state_police_motor_unit: categories.some(x => x.category === "STATE_POLICE_MOTOR_UNIT"),
    has_motorcycle_officer_association: categories.some(x => x.category === "MOTORCYCLE_OFFICER_ASSOCIATION"),
    has_motor_training_program: categories.some(x => x.category === "POLICE_MOTOR_TRAINING_PROGRAM"),
    has_training_coordinator: categories.some(x => x.category === "LAW_ENFORCEMENT_TRAINING_COORDINATOR"),
    has_gang_intelligence_training: categories.some(x => x.category === "GANG_INTELLIGENCE_TRAINING_UNIT")
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
      scoring.outreach_safety.requires_manual_review === true &&
      scoring.outreach_safety.requires_client_safe_language === true
  },

  audit_rule_integrity: {
    minimum_categories: rules.audit_requirements.minimum_source_categories >= 8,
    public_source_required: rules.audit_requirements.requires_public_source_before_outreach === true,
    verified_contact_required: rules.audit_requirements.requires_verified_contact_before_outreach === true,
    no_generated_contacts: rules.audit_requirements.requires_no_generated_contacts === true
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
  audit.audit_rule_integrity.verified_contact_required &&
  audit.audit_rule_integrity.no_generated_contacts;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/motor_units/audit/batch_073_motor_unit_registry_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
