const fs = require("fs");
const path = require("path");

const files = {
  policy: "public/data/security/frontend/frontend_role_policy.v1.json",
  guard: "public/globe/security/frontend_runtime_guard.js",
  manifest: "public/data/security/frontend/frontend_security_manifest.v1.json",
  runtimeRoleModel: "public/data/security/runtime/runtime_role_model.v1.json",
  clientIsolationManifest: "public/data/security/runtime/client_isolation_manifest.v1.json"
};

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const file_checks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const policy = JSON.parse(read(files.policy));
const manifest = JSON.parse(read(files.manifest));
const guardText = read(files.guard);

const audit = {
  version: "umbra_batch_023_frontend_role_enforcement_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  policy_integrity: {
    founder_role_exists: !!policy.roles.FOUNDER,
    client_operator_role_exists: !!policy.roles.CLIENT_OPERATOR,

    client_blocks_founder_admin:
      policy.roles.CLIENT_OPERATOR.blocked_panels.includes("FOUNDER_ADMIN"),

    client_blocks_client_switcher:
      policy.roles.CLIENT_OPERATOR.blocked_panels.includes("CLIENT_SWITCHER"),

    client_blocks_security_audits:
      policy.roles.CLIENT_OPERATOR.blocked_panels.includes("SECURITY_AUDITS"),

    client_blocks_global_data:
      policy.roles.CLIENT_OPERATOR.blocked_panels.includes("GLOBAL_DATA"),

    client_blocks_exports:
      policy.roles.CLIENT_OPERATOR.blocked_panels.includes("EXPORTS")
  },

  guard_integrity: {
    defines_global:
      guardText.includes("window.UmbraFrontendSecurity"),

    has_get_runtime_role:
      guardText.includes("getRuntimeRole"),

    has_can_access_panel:
      guardText.includes("canAccessPanel"),

    has_require_founder:
      guardText.includes("requireFounder"),

    has_assert_client_scope:
      guardText.includes("assertClientScope"),

    has_export_guard:
      guardText.includes("canExportDataset"),

    has_panel_visibility:
      guardText.includes("applyPanelVisibility")
  },

  manifest_integrity: {
    manifest_exists: !!manifest,
    required_global_declared:
      manifest.required_globals.includes("window.UmbraFrontendSecurity"),

    required_functions_declared:
      manifest.required_functions.length >= 8,

    founder_admin_blocked_for_client:
      manifest.blocked_client_panels.includes("FOUNDER_ADMIN"),

    exports_blocked_for_client:
      manifest.blocked_client_panels.includes("EXPORTS")
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.policy_integrity).every(Boolean) &&
  Object.values(audit.guard_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_023_frontend_role_enforcement_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
