const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const manifest =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/adapters/education_discovery_adapter_manifest.v1.json"
  );

const resultSchema =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/results/education_source_result_schema.v1.json"
  );

const validationRules =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/adapters/official_source_validation_rules.v1.json"
  );

const cache =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/cache/education_discovery_result_cache.v1.json"
  );

const runPlan =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/adapters/education_discovery_adapter_run_plan_batch_069.v1.json"
  );

const adapters =
  manifest.adapters || [];

const audit = {
  version:
    "umbra_batch_069_education_discovery_adapter_scaffold_audit_v1",

  generated_at:
    new Date().toISOString(),

  adapter_integrity: {
    adapter_count:
      adapters.length,

    has_web_search_adapter:
      adapters.some(a =>
        a.adapter_type === "OFFICIAL_WEB_SEARCH"
      ),

    has_domain_classifier:
      adapters.some(a =>
        a.adapter_type === "DOMAIN_CLASSIFIER"
      ),

    has_source_validator:
      adapters.some(a =>
        a.adapter_type === "SOURCE_VALIDATOR"
      ),

    has_contact_route_review:
      adapters.some(a =>
        a.adapter_type === "CONTACT_ROUTE_REVIEW"
      ),

    all_outreach_blocked:
      adapters.every(a =>
        a.outreach_allowed === false
      ),

    all_forbid_fake_contacts:
      adapters.every(a =>
        Array.isArray(a.forbidden_result_types) &&
        (
          a.forbidden_result_types.includes("generated_email") ||
          a.forbidden_result_types.includes("generated_phone") ||
          a.forbidden_result_types.includes("unverified_contact")
        )
      )
  },

  result_schema_integrity: {
    required_fields:
      resultSchema.required_fields.length >= 8,

    valid_source_types:
      resultSchema.valid_source_types.length >= 5,

    valid_domain_classifications:
      resultSchema.valid_domain_classifications.length >= 5,

    valid_statuses:
      resultSchema.valid_validation_statuses.length >= 4
  },

  validation_rule_integrity: {
    positive_signals:
      validationRules.positive_signals.length >= 6,

    negative_signals:
      validationRules.negative_signals.length >= 6,

    thresholds_present:
      !!validationRules.promotion_thresholds,

    hard_blocks_present:
      Object.values(validationRules.hard_blocks || {}).every(Boolean)
  },

  cache_integrity: {
    cache_exists:
      !!cache,

    empty_initial_cache:
      Array.isArray(cache.results) &&
      cache.results.length === 0
  },

  run_plan_integrity: {
    task_count:
      runPlan.task_count === 75,

    adapter_count:
      runPlan.adapter_count === 4,

    fake_contact_generation_forbidden:
      runPlan.execution_policy.fake_contact_generation_forbidden === true,

    outreach_allowed_false:
      runPlan.execution_policy.outreach_allowed === false,

    promotion_requires_import:
      runPlan.execution_policy.promotion_requires_source_result_import === true
  }
};

audit.pass =
  audit.adapter_integrity.adapter_count === 4 &&
  audit.adapter_integrity.has_web_search_adapter &&
  audit.adapter_integrity.has_domain_classifier &&
  audit.adapter_integrity.has_source_validator &&
  audit.adapter_integrity.has_contact_route_review &&
  audit.adapter_integrity.all_outreach_blocked &&
  audit.adapter_integrity.all_forbid_fake_contacts &&
  audit.result_schema_integrity.required_fields &&
  audit.result_schema_integrity.valid_source_types &&
  audit.result_schema_integrity.valid_domain_classifications &&
  audit.result_schema_integrity.valid_statuses &&
  audit.validation_rule_integrity.positive_signals &&
  audit.validation_rule_integrity.negative_signals &&
  audit.validation_rule_integrity.thresholds_present &&
  audit.validation_rule_integrity.hard_blocks_present &&
  audit.cache_integrity.cache_exists &&
  audit.cache_integrity.empty_initial_cache &&
  audit.run_plan_integrity.task_count &&
  audit.run_plan_integrity.adapter_count &&
  audit.run_plan_integrity.fake_contact_generation_forbidden &&
  audit.run_plan_integrity.outreach_allowed_false &&
  audit.run_plan_integrity.promotion_requires_import;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/source_discovery/audit/batch_069_adapter_scaffold_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
