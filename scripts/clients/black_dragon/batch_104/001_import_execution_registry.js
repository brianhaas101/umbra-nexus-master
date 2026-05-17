const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const sourceFile =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "real_contact_expansion",
    "source_packs",
    "json",
    "real_source_discovery_import_pack.v1.json"
  );

let rows = [];

if (fs.existsSync(sourceFile)) {

  const payload =
    JSON.parse(
      fs.readFileSync(sourceFile, "utf8")
    );

  if (
    payload &&
    Array.isArray(payload.import_rows)
  ) {
    rows = payload.import_rows;
  }
}

const registry = {

  version:
    "black_dragon_import_execution_registry_v2",

  generated_at:
    new Date().toISOString(),

  checkpoint:
    "BLACK_DRAGON_REAL_CONTACT_EXPANSION_POST_BATCH_103",

  operational_mode:
    "REAL_SOURCE_IMPORT_EXECUTION",

  architecture_rules: {
    placeholders_forbidden: true,
    synthetic_contacts_forbidden: true,
    auto_promotion_forbidden: true,
    outreach_disabled: true,
    founder_review_required: true,
    quarantine_required: true
  },

  counts: {
    source_rows_loaded:
      rows.length
  },

  execution_targets:

    rows.map((row, index) => ({

      execution_id:
        `IMPORT_EXEC_${String(index + 1).padStart(4, "0")}`,

      import_row_id:
        row.import_row_id || null,

      discovery_task_id:
        row.discovery_task_id || null,

      source_type:
        row.source_type || null,

      source_url:
        row.source_url || null,

      source_title:
        row.source_title || null,

      organization_seed:
        row.organization_seed || null,

      discovered_organization_name:
        row.discovered_organization_name || null,

      contact_route:
        row.contact_route || null,

      contact_route_type:
        row.contact_route_type || null,

      contact_person_or_role:
        row.contact_person_or_role || null,

      founder_review_required:
        true,

      outreach_allowed:
        false,

      promotion_allowed:
        false,

      quarantine_status:
        "NOT_TRIGGERED",

      execution_state:
        "QUEUED_FOR_VALIDATION"
    }))
};

const out =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "registries",
    "import_execution_registry.json"
  );

fs.writeFileSync(
  out,
  JSON.stringify(registry, null, 2)
);

console.log(JSON.stringify({

  status:
    "IMPORT_EXECUTION_REGISTRY_PATCH_COMPLETE",

  source_rows_loaded:
    rows.length,

  execution_targets:
    registry.execution_targets.length,

  output:
    out

}, null, 2));
