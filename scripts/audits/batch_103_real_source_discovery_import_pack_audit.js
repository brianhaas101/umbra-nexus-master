const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const jsonFile =
  "public/data/clients/black_dragon/real_contact_expansion/source_packs/json/real_source_discovery_import_pack.v1.json";

const csvFile =
  "public/data/clients/black_dragon/real_contact_expansion/source_packs/csv/real_source_discovery_import_pack.csv";

const payload =
  readJson(jsonFile);

const rows =
  payload.import_rows || [];

const audit = {
  version:
    "umbra_batch_103_real_source_discovery_import_pack_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity: {
    json_exists:
      exists(jsonFile),

    csv_exists:
      exists(csvFile)
  },

  pack_integrity: {
    import_rows:
      rows.length,

    all_have_import_ids:
      rows.every(x => !!x.import_row_id),

    all_have_discovery_ids:
      rows.every(x => !!x.discovery_task_id),

    all_have_search_queries:
      rows.every(x => !!x.search_query),

    all_awaiting_real_input:
      rows.every(x =>
        x.import_status === "AWAITING_REAL_SOURCE_INPUT"
      ),

    no_source_urls_prefilled:
      rows.every(x => x.source_url === ""),

    no_contacts_prefilled:
      rows.every(x => x.contact_route === ""),

    all_forbid_placeholders:
      rows.every(x =>
        String(x.forbidden).includes("NO_PLACEHOLDERS")
      )
  },

  safety_integrity: {
    ready_for_import_zero:
      payload.totals.ready_for_import === 0,

    source_urls_filled_zero:
      payload.totals.source_urls_filled === 0,

    contact_routes_filled_zero:
      payload.totals.contact_routes_filled === 0
  }
};

audit.pass =
  audit.file_integrity.json_exists &&
  audit.file_integrity.csv_exists &&
  audit.pack_integrity.import_rows === 180 &&
  audit.pack_integrity.all_have_import_ids &&
  audit.pack_integrity.all_have_discovery_ids &&
  audit.pack_integrity.all_have_search_queries &&
  audit.pack_integrity.all_awaiting_real_input &&
  audit.pack_integrity.no_source_urls_prefilled &&
  audit.pack_integrity.no_contacts_prefilled &&
  audit.pack_integrity.all_forbid_placeholders &&
  audit.safety_integrity.ready_for_import_zero &&
  audit.safety_integrity.source_urls_filled_zero &&
  audit.safety_integrity.contact_routes_filled_zero;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/real_contact_expansion/source_packs/audit/batch_103_real_source_discovery_import_pack_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
