const fs = require("fs");
const path = require("path");

const files = {
  policy: "public/data/security/session/client_session_policy.v1.json",
  guard: "public/globe/security/session_recovery_guard.js",
  manifest: "public/data/security/session/session_security_manifest.v1.json",
  injectionReport: "public/data/security/session/session_guard_injection_report.v1.json"
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
const injection = JSON.parse(read(files.injectionReport));

const audit = {
  version: "umbra_batch_025_session_persistence_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  policy_integrity: {
    required_fields_declared:
      policy.required_session_fields.length >= 6,

    founder_role_allowed:
      policy.allowed_runtime_roles.includes("FOUNDER"),

    client_role_allowed:
      policy.allowed_runtime_roles.includes("CLIENT_OPERATOR"),

    black_dragon_allowed:
      policy.allowed_client_ids.includes("black_dragon"),

    client_cannot_restore_founder:
      policy.client_operator_rules.cannot_restore_founder_runtime === true,

    client_cannot_restore_global:
      policy.client_operator_rules.cannot_restore_global_dataset === true,

    stale_client_resets_safe:
      policy.stale_session_rules.client_stale_session_resets_to_safe_client_runtime === true
  },

  guard_integrity: {
    defines_global:
      guardText.includes("window.UmbraSessionSecurity"),

    has_restore_session:
      guardText.includes("restoreSession"),

    has_validate_session:
      guardText.includes("validateSession"),

    has_safe_client_session:
      guardText.includes("safeClientSession"),

    has_stale_check:
      guardText.includes("isStale"),

    uses_local_storage:
      guardText.includes("localStorage"),

    has_debug_state:
      guardText.includes("getDebugState")
  },

  manifest_integrity: {
    manifest_exists:
      !!manifest,

    required_global_declared:
      manifest.required_global === "window.UmbraSessionSecurity",

    functions_declared:
      manifest.required_functions.length >= 6,

    stale_reset_required:
      manifest.hard_requirements.stale_sessions_reset_to_safe_runtime === true
  },

  injection_integrity: {
    at_least_one_entry_checked:
      injection.report.length > 0,

    all_checked_have_session_guard:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_session_guard)
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.policy_integrity).every(Boolean) &&
  Object.values(audit.guard_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_025_session_persistence_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
