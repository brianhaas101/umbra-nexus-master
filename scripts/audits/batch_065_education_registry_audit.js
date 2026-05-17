const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const registry =
  readJson(
    "public/data/clients/black_dragon/education/sources/education_source_registry.v1.json"
  );

const normalization =
  readJson(
    "public/data/clients/black_dragon/education/normalization/education_normalization_schema.v1.json"
  );

const scoring =
  readJson(
    "public/data/clients/black_dragon/education/scoring/education_scoring.v1.json"
  );

const auditRules =
  readJson(
    "public/data/clients/black_dragon/education/audit/education_audit_rules.v1.json"
  );

const categories =
  registry.source_categories || [];

const audit = {
  version:
    "umbra_batch_065_education_registry_audit_v1",

  generated_at:
    new Date().toISOString(),

  registry_integrity: {
    source_category_count:
      categories.length,

    has_post_academies:
      categories.some(x =>
        x.category === "STATE_POST_ACADEMY"
      ),

    has_police_academies:
      categories.some(x =>
        x.category === "REGIONAL_POLICE_ACADEMY"
      ),

    has_sheriff_training:
      categories.some(x =>
        x.category === "SHERIFF_TRAINING_CENTER"
      ),

    has_criminal_justice:
      categories.some(x =>
        x.category === "CRIMINAL_JUSTICE_COLLEGE"
      ),

    has_intelligence_programs:
      categories.some(x =>
        x.category === "INTELLIGENCE_ANALYSIS_PROGRAM"
      ),

    has_public_safety:
      categories.some(x =>
        x.category === "PUBLIC_SAFETY_INSTITUTE"
      ),

    has_rider_education:
      categories.some(x =>
        x.category === "RIDER_EDUCATION_PROGRAM"
      ),

    has_msf:
      categories.some(x =>
        x.category === "MSF_ALIGNED_PROGRAM"
      ),

    has_veteran_programs:
      categories.some(x =>
        x.category === "VETERAN_TRANSITION_PROGRAM"
      )
  },

  normalization_integrity: {
    required_fields:
      normalization.required_fields.length >= 5,

    optional_fields:
      normalization.optional_fields.length >= 10,

    classification_rules:
      Object.keys(
        normalization.classification_rules || {}
      ).length >= 5
  },

  scoring_integrity: {
    institutional_weights:
      Object.keys(
        scoring.institutional_weights || {}
      ).length >= 10,

    propagation_multipliers:
      Object.keys(
        scoring.propagation_multipliers || {}
      ).length >= 5
  },

  audit_integrity: {
    minimum_categories:
      auditRules.audit_requirements.minimum_source_categories >= 12,

    curriculum_support_required:
      auditRules.audit_requirements.requires_curriculum_support === true,

    instructor_support_required:
      auditRules.audit_requirements.requires_instructor_propagation === true
  }
};

audit.pass =
  audit.registry_integrity.source_category_count >= 12 &&
  Object.values(audit.registry_integrity)
    .slice(1)
    .every(Boolean) &&
  audit.normalization_integrity.required_fields &&
  audit.normalization_integrity.optional_fields &&
  audit.normalization_integrity.classification_rules &&
  audit.scoring_integrity.institutional_weights &&
  audit.scoring_integrity.propagation_multipliers &&
  audit.audit_integrity.minimum_categories &&
  audit.audit_integrity.curriculum_support_required &&
  audit.audit_integrity.instructor_support_required;

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_065_education_registry_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
