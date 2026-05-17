const fs = require("fs");
const path = require("path");

const packPath = path.resolve(
  "public/data/clients/black_dragon/books/execution/test_pack_001/outreach_execution_test_pack_001.json"
);

const resultsPath = path.resolve(
  "public/data/clients/black_dragon/books/execution/test_pack_001/outreach_test_pack_001_results.json"
);

const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));
const results = JSON.parse(fs.readFileSync(resultsPath, "utf8"));

const targets = pack.targets || [];

const audit = {
  version: "black_dragon_books_batch_019_execution_test_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    selected_targets: targets.length,
    manual_results_logged: results.results.length
  },

  integrity: {
    missing_entity_ids: targets.filter(t => !t.entity_id).length,
    missing_contact_routes: targets.filter(t => !t.contact_route).length,
    missing_subjects: targets.filter(t => !t.message_subject).length,
    missing_bodies: targets.filter(t => !t.message_body).length,
    invalid_execution_status: targets.filter(t => t.execution_status !== "READY_TO_SEND_MANUALLY").length
  },

  safety: {
    automated_sending_allowed: pack.execution_rules.automated_sending_allowed === false,
    manual_send_only: pack.execution_rules.manual_send_only === true,
    public_contact_routes_only: pack.execution_rules.public_contact_routes_only === true,
    no_private_group_contact: pack.execution_rules.no_private_group_contact === true,
    no_fabricated_contacts: pack.execution_rules.no_fabricated_contacts === true
  },

  operational_state: {
    execution_test_pack_exists: !!pack,
    result_log_exists: !!results,
    ready_for_manual_outreach_test: targets.length > 0
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_contact_routes === 0 &&
  audit.integrity.missing_subjects === 0 &&
  audit.integrity.missing_bodies === 0 &&
  audit.integrity.invalid_execution_status === 0 &&
  Object.values(audit.safety).every(Boolean) &&
  audit.operational_state.execution_test_pack_exists &&
  audit.operational_state.result_log_exists &&
  audit.operational_state.ready_for_manual_outreach_test;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_019_execution_test_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
