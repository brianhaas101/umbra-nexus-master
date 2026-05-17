const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const gateFile =
  "public/data/clients/black_dragon/client_access/view_gate/restricted_client_view_gate.v1.json";

const gate =
  readJson(gateFile);

const rows =
  gate.visible_client_entities || [];

const audit = {
  version:
    "umbra_batch_100_restricted_client_outreach_view_gate_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity: {
    gate_exists:
      exists(gateFile)
  },

  access_integrity: {
    client_access_enabled:
      gate.client_access_enabled === true,

    outreach_disabled:
      gate.outreach_enabled === false,

    contact_layer_disabled:
      gate.contact_layer_enabled === false,

    founder_override_required:
      gate.founder_override_required === true
  },

  entity_integrity: {
    visible_entities:
      rows.length,

    all_safe_mode:
      rows.every(x =>
        x.client_safe_status ===
        "VISIBLE_SAFE_NON_CONTACT_MODE"
      ),

    no_contact_details_visible:
      rows.every(x =>
        x.contact_details_visible === false
      ),

    no_source_urls_visible:
      rows.every(x =>
        x.source_url_visible === false
      ),

    no_outreach_enabled:
      rows.every(x =>
        x.outreach_allowed === false
      )
  },

  safety_integrity: {
    blocked_layers_present:
      Array.isArray(gate.blocked_layers) &&
      gate.blocked_layers.length >= 5,

    zero_contact_ready_runtime:
      gate.totals.contact_ready_targets === 0,

    zero_outreach_targets:
      gate.totals.outreach_enabled_targets === 0
  }
};

audit.pass =
  audit.file_integrity.gate_exists &&
  audit.access_integrity.client_access_enabled &&
  audit.access_integrity.outreach_disabled &&
  audit.access_integrity.contact_layer_disabled &&
  audit.access_integrity.founder_override_required &&
  audit.entity_integrity.visible_entities === 637 &&
  audit.entity_integrity.all_safe_mode &&
  audit.entity_integrity.no_contact_details_visible &&
  audit.entity_integrity.no_source_urls_visible &&
  audit.entity_integrity.no_outreach_enabled &&
  audit.safety_integrity.blocked_layers_present &&
  audit.safety_integrity.zero_contact_ready_runtime &&
  audit.safety_integrity.zero_outreach_targets;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/client_access/audit/batch_100_restricted_client_outreach_view_gate_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
