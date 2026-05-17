const fs = require("fs");
const path = require("path");

const files = {
  exportPolicy:
    "public/data/security/exports/export_security_policy.v1.json",

  datasetPolicy:
    "public/data/security/datasets/dataset_access_policy.v1.json",

  datasetGuard:
    "public/globe/security/dataset_access_guard.js",

  exportGuard:
    "public/globe/security/export_security_guard.js",

  manifest:
    "public/data/security/datasets/dataset_export_security_manifest.v1.json",

  injectionReport:
    "public/data/security/datasets/dataset_export_injection_report.v1.json"
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

const exportPolicy =
  JSON.parse(read(files.exportPolicy));

const datasetPolicy =
  JSON.parse(read(files.datasetPolicy));

const manifest =
  JSON.parse(read(files.manifest));

const injection =
  JSON.parse(read(files.injectionReport));

const datasetGuardText =
  read(files.datasetGuard);

const exportGuardText =
  read(files.exportGuard);

const audit = {

  version: "umbra_batch_026_dataset_export_security_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  export_policy_integrity: {

    client_raw_export_blocked:
      exportPolicy.client_operator_permissions.raw_dataset_export === false,

    client_global_export_blocked:
      exportPolicy.client_operator_permissions.global_export === false,

    founder_global_export_allowed:
      exportPolicy.founder_permissions.global_export === true,

    cross_client_export_forbidden:
      exportPolicy.hard_rules.cross_client_export_forbidden === true
  },

  dataset_policy_integrity: {

    restricted_roots_declared:
      datasetPolicy.restricted_dataset_roots.length >= 5,

    client_scope_required:
      datasetPolicy.runtime_rules.client_scope_required === true,

    cross_client_fetch_blocked:
      datasetPolicy.runtime_rules.cross_client_dataset_fetch_forbidden === true
  },

  dataset_guard_integrity: {

    defines_global:
      datasetGuardText.includes("window.UmbraDatasetSecurity"),

    has_access_guard:
      datasetGuardText.includes("canAccessDataset"),

    has_guarded_fetch:
      datasetGuardText.includes("guardedFetch"),

    blocks_restricted_roots:
      datasetGuardText.includes("Restricted dataset blocked"),

    validates_client_scope:
      datasetGuardText.includes("isClientScoped")
  },

  export_guard_integrity: {

    defines_global:
      exportGuardText.includes("window.UmbraExportSecurity"),

    has_export_guard:
      exportGuardText.includes("guardedExport"),

    blocks_invalid_exports:
      exportGuardText.includes("Export blocked")
  },

  injection_integrity: {

    entries_checked:
      injection.report.length > 0,

    all_entries_have_dataset_guard:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_dataset_guard),

    all_entries_have_export_guard:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_export_guard)
  }
};

audit.pass =

  file_checks.every(f => f.exists) &&
  Object.values(audit.export_policy_integrity).every(Boolean) &&
  Object.values(audit.dataset_policy_integrity).every(Boolean) &&
  Object.values(audit.dataset_guard_integrity).every(Boolean) &&
  Object.values(audit.export_guard_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/security/audit/batch_026_dataset_export_security_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
