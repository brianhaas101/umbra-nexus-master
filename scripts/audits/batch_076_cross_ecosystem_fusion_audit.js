const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const registry = readJson("public/data/clients/black_dragon/fusion/registries/cross_ecosystem_fusion_registry.v1.json");
const scoring = readJson("public/data/clients/black_dragon/fusion/scoring/cross_ecosystem_scoring.v1.json");
const runtime = readJson("public/data/clients/black_dragon/fusion/runtime/cross_ecosystem_runtime.v1.json");
const rules = readJson("public/data/clients/black_dragon/fusion/audit/cross_ecosystem_audit_rules.v1.json");

const ecosystems = registry.ecosystems || [];
const relationships = registry.fusion_relationships || [];

const audit = {
  version: "umbra_batch_076_cross_ecosystem_fusion_audit_v1",
  generated_at: new Date().toISOString(),

  registry_integrity: {
    ecosystem_count: ecosystems.length,
    relationship_count: relationships.length,

    has_education: ecosystems.some(x => x.ecosystem === "EDUCATION"),
    has_veteran: ecosystems.some(x => x.ecosystem === "VETERAN"),
    has_motor: ecosystems.some(x => x.ecosystem === "LAW_ENFORCEMENT_MOTOR"),
    has_distribution: ecosystems.some(x => x.ecosystem === "DISTRIBUTION"),
    has_events: ecosystems.some(x => x.ecosystem === "EVENT_INFRASTRUCTURE"),

    has_event_distribution_relationship:
      relationships.some(x => x.relationship === "EVENT_TO_DISTRIBUTION"),

    has_event_propagation_relationship:
      relationships.some(x => x.relationship === "EVENT_TO_PROPAGATION"),

    has_education_law_relationship:
      relationships.some(x => x.relationship === "EDUCATION_TO_LAW_ENFORCEMENT")
  },

  scoring_integrity: {
    fusion_multipliers:
      Object.keys(scoring.fusion_multipliers || {}).length >= 8,

    priority_weights:
      Object.keys(scoring.priority_weights || {}).length >= 5,

    safety_rules_locked:
      scoring.safety_rules.requires_public_source === true &&
      scoring.safety_rules.requires_verified_contact_route === true &&
      scoring.safety_rules.requires_manual_review === true &&
      scoring.safety_rules.forbids_generated_contacts === true &&
      scoring.safety_rules.forbids_auto_outreach === true
  },

  runtime_integrity: {
    fusion_enabled:
      runtime.runtime_state.fusion_enabled === true,

    ecosystem_count:
      runtime.runtime_state.ecosystem_count === 5,

    cross_relationships_enabled:
      runtime.runtime_state.cross_relationships_enabled === true,

    propagation_scoring_enabled:
      runtime.runtime_state.propagation_scoring_enabled === true,

    auto_outreach_blocked:
      runtime.runtime_state.blocked_runtime_features.includes(
        "auto_outreach_generation"
      )
  },

  audit_rule_integrity: {
    minimum_ecosystems:
      rules.audit_requirements.minimum_ecosystems >= 5,

    minimum_relationships:
      rules.audit_requirements.minimum_relationships >= 6,

    public_source_required:
      rules.audit_requirements.requires_public_source_before_outreach === true,

    verified_contact_required:
      rules.audit_requirements.requires_verified_contact_before_outreach === true,

    no_generated_contacts:
      rules.audit_requirements.requires_no_generated_contacts === true,

    auto_outreach_blocked:
      rules.audit_requirements.requires_auto_outreach_blocked === true
  }
};

audit.pass =
  audit.registry_integrity.ecosystem_count >= 5 &&
  audit.registry_integrity.relationship_count >= 6 &&
  Object.values(audit.registry_integrity).slice(2).every(Boolean) &&
  audit.scoring_integrity.fusion_multipliers &&
  audit.scoring_integrity.priority_weights &&
  audit.scoring_integrity.safety_rules_locked &&
  audit.runtime_integrity.fusion_enabled &&
  audit.runtime_integrity.ecosystem_count &&
  audit.runtime_integrity.cross_relationships_enabled &&
  audit.runtime_integrity.propagation_scoring_enabled &&
  audit.runtime_integrity.auto_outreach_blocked &&
  audit.audit_rule_integrity.minimum_ecosystems &&
  audit.audit_rule_integrity.minimum_relationships &&
  audit.audit_rule_integrity.public_source_required &&
  audit.audit_rule_integrity.verified_contact_required &&
  audit.audit_rule_integrity.no_generated_contacts &&
  audit.audit_rule_integrity.auto_outreach_blocked;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/fusion/audit/batch_076_cross_ecosystem_fusion_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
