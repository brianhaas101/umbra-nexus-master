const fs = require("fs");
const path = require("path");

const files = {
  frontendGuard: "public/globe/security/frontend_runtime_guard.js",
  uiHook: "public/globe/security/ui_panel_security_hook.js",
  frontendPolicy: "public/data/security/frontend/frontend_role_policy.v1.json",
  uiManifest: "public/data/security/ui/ui_security_integration_manifest.v1.json",
  injectionReport: "public/data/security/ui/ui_security_script_injection_report.v1.json"
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

const uiHookText = read(files.uiHook);
const manifest = JSON.parse(read(files.uiManifest));
const injectionReport = JSON.parse(read(files.injectionReport));

const audit = {
  version: "umbra_batch_024_ui_hook_integration_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  hook_integrity: {
    defines_global: uiHookText.includes("window.UmbraUIPanelSecurity"),
    calls_frontend_guard: uiHookText.includes("window.UmbraFrontendSecurity"),
    has_apply_security: uiHookText.includes("applySecurity"),
    has_panel_suppression: uiHookText.includes("suppressNode"),
    has_mutation_observer: uiHookText.includes("MutationObserver"),
    has_debug_state: uiHookText.includes("getDebugState")
  },

  manifest_integrity: {
    required_scripts_declared:
      manifest.required_scripts_in_order.length === 2,

    frontend_guard_first:
      manifest.required_scripts_in_order[0].includes("frontend_runtime_guard"),

    ui_hook_second:
      manifest.required_scripts_in_order[1].includes("ui_panel_security_hook"),

    blocked_contract_present:
      manifest.client_operator_must_block.includes("FOUNDER_ADMIN") &&
      manifest.client_operator_must_block.includes("EXPORTS"),

    allowed_contract_present:
      manifest.client_operator_must_allow.includes("BLACK_DRAGON_BOOKS") &&
      manifest.client_operator_must_allow.includes("OUTREACH_QUEUE")
  },

  injection_integrity: {
    at_least_one_html_checked:
      injectionReport.patched.length > 0,

    all_checked_have_frontend_guard:
      injectionReport.patched.length > 0 &&
      injectionReport.patched.every(p => p.has_frontend_guard),

    all_checked_have_ui_hook:
      injectionReport.patched.length > 0 &&
      injectionReport.patched.every(p => p.has_ui_hook)
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.hook_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_024_ui_hook_integration_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
