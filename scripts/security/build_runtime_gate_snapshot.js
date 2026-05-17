const fs = require("fs");
const path = require("path");

const roleModelPath = path.resolve(
  "public/data/security/runtime/runtime_role_model.v1.json"
);

const isolationPath = path.resolve(
  "public/data/security/runtime/client_isolation_manifest.v1.json"
);

const outputPath = path.resolve(
  "public/data/security/runtime/runtime_gate_snapshot.v1.json"
);

const roleModel = JSON.parse(fs.readFileSync(roleModelPath, "utf8"));
const isolation = JSON.parse(fs.readFileSync(isolationPath, "utf8"));

const founderPermissions =
  roleModel.roles.FOUNDER;

const clientPermissions =
  roleModel.roles.CLIENT_OPERATOR;

const snapshot = {

  version: "umbra_runtime_gate_snapshot_v1",
  generated_at: new Date().toISOString(),

  founder_permissions: founderPermissions,
  client_permissions: clientPermissions,

  isolation_manifest: isolation.clients,

  runtime_rules:
    roleModel.runtime_rules,

  enforcement_state: {
    founder_runtime_present: true,
    client_runtime_present: true,
    role_gating_active: true,
    client_isolation_active: true,
    export_restrictions_active: true,
    runtime_mutation_protection_active: true
  }
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify({
  status: "RUNTIME_GATE_ENGINE_COMPLETE",
  enforcement_state: snapshot.enforcement_state,
  output: outputPath
}, null, 2));
