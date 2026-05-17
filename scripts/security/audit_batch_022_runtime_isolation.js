const fs = require("fs");
const path = require("path");

const roleModelPath = path.resolve(
  "public/data/security/runtime/runtime_role_model.v1.json"
);

const isolationPath = path.resolve(
  "public/data/security/runtime/client_isolation_manifest.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/security/runtime/runtime_gate_snapshot.v1.json"
);

const roleModel = JSON.parse(fs.readFileSync(roleModelPath, "utf8"));
const isolation = JSON.parse(fs.readFileSync(isolationPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const founder =
  roleModel.roles.FOUNDER;

const client =
  roleModel.roles.CLIENT_OPERATOR;

const audit = {

  version: "umbra_batch_022_runtime_isolation_audit_v1",
  generated_at: new Date().toISOString(),

  role_integrity: {

    founder_runtime_admin:
      founder.runtime_admin === true,

    founder_client_switching:
      founder.client_switching === true,

    client_runtime_admin_restricted:
      client.runtime_admin === false,

    client_client_switching_restricted:
      client.client_switching === false,

    client_export_restricted:
      client.dataset_export === false
  },

  isolation_integrity: {

    strict_client_isolation:
      roleModel.runtime_rules.strict_client_isolation === true,

    cross_client_visibility_forbidden:
      roleModel.runtime_rules.cross_client_visibility_forbidden === true,

    cross_client_dataset_access_forbidden:
      isolation.hard_rules.cross_client_dataset_access_forbidden === true,

    cross_client_queue_access_forbidden:
      isolation.hard_rules.cross_client_queue_access_forbidden === true,

    cross_client_response_access_forbidden:
      isolation.hard_rules.cross_client_response_access_forbidden === true
  },

  runtime_integrity: {

    runtime_gate_snapshot_exists:
      !!snapshot,

    role_gating_active:
      snapshot.enforcement_state.role_gating_active === true,

    client_isolation_active:
      snapshot.enforcement_state.client_isolation_active === true,

    export_restrictions_active:
      snapshot.enforcement_state.export_restrictions_active === true,

    runtime_mutation_protection_active:
      snapshot.enforcement_state.runtime_mutation_protection_active === true
  }
};

audit.pass =

  Object.values(audit.role_integrity).every(Boolean) &&
  Object.values(audit.isolation_integrity).every(Boolean) &&
  Object.values(audit.runtime_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/security/audit/batch_022_runtime_isolation_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
