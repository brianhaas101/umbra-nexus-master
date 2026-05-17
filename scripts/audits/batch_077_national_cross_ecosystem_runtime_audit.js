const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const runtime = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const cityIndex = readJson(
  "public/data/clients/black_dragon/national/cities/national_city_ecosystem_index.v1.json"
);

const entities = runtime.runtime_entities || [];
const cities = cityIndex.cities || [];

const audit = {
  version: "umbra_batch_077_national_cross_ecosystem_runtime_audit_v1",
  generated_at: new Date().toISOString(),

  runtime_integrity: {
    national_cities: runtime.totals.national_cities,
    ecosystems: runtime.totals.ecosystems,
    runtime_entities: runtime.totals.runtime_entities,

    has_education: entities.some(e => e.ecosystem === "EDUCATION"),
    has_veteran: entities.some(e => e.ecosystem === "VETERAN"),
    has_motor: entities.some(e => e.ecosystem === "LAW_ENFORCEMENT_MOTOR"),
    has_distribution: entities.some(e => e.ecosystem === "DISTRIBUTION"),
    has_events: entities.some(e => e.ecosystem === "EVENT_INFRASTRUCTURE"),

    all_client_scoped: entities.every(e => e.client_id === "black_dragon"),
    all_have_coordinates: entities.every(e => typeof e.lat === "number" && typeof e.lon === "number"),
    all_have_city_region: entities.every(e => !!e.city && !!e.region),
    all_have_entity_class: entities.every(e => !!e.entity_class),
    all_have_source_category: entities.every(e => !!e.source_category)
  },

  safety_integrity: {
    outreach_allowed_zero: runtime.totals.outreach_allowed === 0,
    all_blocked_until_verified: entities.every(e => e.outreach_allowed === false),
    all_unverified: entities.every(e => e.verification_status === "NEEDS_PUBLIC_SOURCE_DISCOVERY"),
    no_contacts_attached: entities.every(e => e.contact_status === "NO_CONTACT_ATTACHED"),
    all_forbidden_actions_present: entities.every(e =>
      Array.isArray(e.forbidden_actions) &&
      e.forbidden_actions.includes("NO_OUTREACH") &&
      e.forbidden_actions.includes("NO_AUTO_CONTACT")
    )
  },

  city_integrity: {
    city_count_matches: cities.length === runtime.totals.national_cities,
    all_cities_have_entities: cities.every(c => c.entity_count > 0),
    all_cities_have_all_ecosystems: cities.every(c => Array.isArray(c.ecosystems) && c.ecosystems.length === 5),
    all_city_outreach_zero: cities.every(c => c.outreach_allowed === 0)
  }
};

audit.pass =
  audit.runtime_integrity.national_cities >= 50 &&
  audit.runtime_integrity.ecosystems === 5 &&
  audit.runtime_integrity.runtime_entities >= 1000 &&
  audit.runtime_integrity.has_education &&
  audit.runtime_integrity.has_veteran &&
  audit.runtime_integrity.has_motor &&
  audit.runtime_integrity.has_distribution &&
  audit.runtime_integrity.has_events &&
  audit.runtime_integrity.all_client_scoped &&
  audit.runtime_integrity.all_have_coordinates &&
  audit.runtime_integrity.all_have_city_region &&
  audit.runtime_integrity.all_have_entity_class &&
  audit.runtime_integrity.all_have_source_category &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.all_blocked_until_verified &&
  audit.safety_integrity.all_unverified &&
  audit.safety_integrity.no_contacts_attached &&
  audit.safety_integrity.all_forbidden_actions_present &&
  audit.city_integrity.city_count_matches &&
  audit.city_integrity.all_cities_have_entities &&
  audit.city_integrity.all_cities_have_all_ecosystems &&
  audit.city_integrity.all_city_outreach_zero;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/audit/batch_077_national_cross_ecosystem_runtime_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
