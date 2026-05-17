const fs = require("fs");
const path = require("path");

const files = {
  entityTaxonomy:
    "public/data/clients/black_dragon/taxonomy/entity_taxonomy.v2.json",

  relationshipTaxonomy:
    "public/data/clients/black_dragon/relationships/relationship_taxonomy.v1.json",

  distributionScoring:
    "public/data/clients/black_dragon/scoring/distribution_scoring.v1.json",

  renderTaxonomy:
    "public/data/clients/black_dragon/rendering/render_taxonomy.v1.json"
};

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const entityTaxonomy =
  readJson(files.entityTaxonomy);

const relationshipTaxonomy =
  readJson(files.relationshipTaxonomy);

const distributionScoring =
  readJson(files.distributionScoring);

const renderTaxonomy =
  readJson(files.renderTaxonomy);

const entityClasses =
  entityTaxonomy.entity_classes || [];

const audit = {
  version:
    "umbra_batch_064_multi_role_taxonomy_audit_v1",

  generated_at:
    new Date().toISOString(),

  taxonomy_integrity: {
    entity_class_count:
      entityClasses.length,

    has_education_nodes:
      entityClasses.some(x =>
        x.entity_class === "EDUCATION_NODE"
      ),

    has_training_nodes:
      entityClasses.some(x =>
        x.entity_class === "TRAINING_NODE"
      ),

    has_law_enforcement_nodes:
      entityClasses.some(x =>
        x.entity_class === "LAW_ENFORCEMENT_NODE"
      ),

    has_motor_unit_nodes:
      entityClasses.some(x =>
        x.entity_class === "MOTOR_UNIT_NODE"
      ),

    has_veteran_nodes:
      entityClasses.some(x =>
        x.entity_class === "VETERAN_NODE"
      ),

    has_dealership_nodes:
      entityClasses.some(x =>
        x.entity_class === "DEALERSHIP_NODE"
      ),

    has_event_nodes:
      entityClasses.some(x =>
        x.entity_class === "EVENT_NODE"
      ),

    has_distribution_nodes:
      entityClasses.some(x =>
        x.entity_class === "DISTRIBUTION_NODE"
      ),

    has_propagation_nodes:
      entityClasses.some(x =>
        x.entity_class === "PROPAGATION_NODE"
      )
  },

  relationship_integrity: {
    relationship_count:
      relationshipTaxonomy.relationship_types.length,

    curriculum_adoption_present:
      relationshipTaxonomy.relationship_types.includes(
        "CURRICULUM_ADOPTION"
      ),

    media_propagation_present:
      relationshipTaxonomy.relationship_types.includes(
        "MEDIA_PROPAGATION"
      ),

    influence_propagation_present:
      relationshipTaxonomy.relationship_types.includes(
        "INFLUENCE_PROPAGATION"
      ),

    institutional_adoption_present:
      relationshipTaxonomy.relationship_types.includes(
        "INSTITUTIONAL_ADOPTION"
      )
  },

  scoring_integrity: {
    scoring_categories:
      Object.keys(
        distributionScoring.distribution_weights || {}
      ).length >= 10
  },

  rendering_integrity: {
    render_classes:
      Object.keys(
        renderTaxonomy.render_classes || {}
      ).length >= 10
  }
};

audit.pass =
  audit.taxonomy_integrity.entity_class_count >= 15 &&
  Object.values(audit.taxonomy_integrity)
    .slice(1)
    .every(Boolean) &&
  Object.values(audit.relationship_integrity)
    .slice(1)
    .every(Boolean) &&
  audit.scoring_integrity.scoring_categories &&
  audit.rendering_integrity.render_classes;

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_064_multi_role_taxonomy_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
