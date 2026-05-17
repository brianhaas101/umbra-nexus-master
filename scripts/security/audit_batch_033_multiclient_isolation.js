const fs = require("fs");
const path = require("path");

const matrixPath = path.resolve(
  "public/data/security/multiclient/multiclient_isolation_test_matrix.v1.json"
);

const datasetPolicyPath = path.resolve(
  "public/data/security/datasets/dataset_access_policy.v1.json"
);

const frontendPolicyPath = path.resolve(
  "public/data/security/frontend/frontend_role_policy.v1.json"
);

const exportPolicyPath = path.resolve(
  "public/data/security/exports/export_security_policy.v1.json"
);

const blackDragonPaths = {
  queue: "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  responses: "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",
  adaptive: "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",
  dashboard: "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json"
};

const shadowPaths = {
  queue: "public/data/clients/test_client_shadow/books/queue/outreach_ready_queue.v1.json",
  responses: "public/data/clients/test_client_shadow/books/responses/classified_responses.v1.json",
  adaptive: "public/data/clients/test_client_shadow/books/adaptive_priority/adaptive_priority_index.v1.json"
};

function exists(p) {
  return fs.existsSync(path.resolve(p));
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(p), "utf8"));
}

const matrix = readJson(matrixPath);
const datasetPolicy = readJson(datasetPolicyPath);
const frontendPolicy = readJson(frontendPolicyPath);
const exportPolicy = readJson(exportPolicyPath);

const blackDragonData = Object.fromEntries(
  Object.entries(blackDragonPaths).map(([key, file]) => [key, readJson(file)])
);

const shadowData = Object.fromEntries(
  Object.entries(shadowPaths).map(([key, file]) => [key, readJson(file)])
);

function containsShadowLeak(obj) {
  return JSON.stringify(obj).includes("SHADOW");
}

const audit = {
  version: "umbra_batch_033_multiclient_isolation_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks: {
    matrix_exists: exists(matrixPath),
    dataset_policy_exists: exists(datasetPolicyPath),
    frontend_policy_exists: exists(frontendPolicyPath),
    export_policy_exists: exists(exportPolicyPath),
    black_dragon_queue_exists: exists(blackDragonPaths.queue),
    black_dragon_responses_exists: exists(blackDragonPaths.responses),
    black_dragon_adaptive_exists: exists(blackDragonPaths.adaptive),
    black_dragon_dashboard_exists: exists(blackDragonPaths.dashboard),
    shadow_queue_exists: exists(shadowPaths.queue),
    shadow_responses_exists: exists(shadowPaths.responses),
    shadow_adaptive_exists: exists(shadowPaths.adaptive)
  },

  matrix_integrity: {
    has_black_dragon:
      matrix.clients.some(c => c.client_id === "black_dragon"),

    has_shadow_client:
      matrix.clients.some(c => c.client_id === "test_client_shadow"),

    cross_client_access_forbidden:
      matrix.isolation_rules.client_cannot_access_other_client_root === true,

    cross_client_queue_forbidden:
      matrix.isolation_rules.client_cannot_access_other_client_queue === true,

    cross_client_responses_forbidden:
      matrix.isolation_rules.client_cannot_access_other_client_responses === true,

    cross_client_adaptive_forbidden:
      matrix.isolation_rules.client_cannot_access_other_client_adaptive_priority === true
  },

  policy_integrity: {
    client_scope_required:
      datasetPolicy.runtime_rules.client_scope_required === true,

    cross_client_dataset_fetch_forbidden:
      datasetPolicy.runtime_rules.cross_client_dataset_fetch_forbidden === true,

    client_switcher_blocked:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("CLIENT_SWITCHER"),

    cross_client_export_forbidden:
      exportPolicy.hard_rules.cross_client_export_forbidden === true
  },

  black_dragon_scope_integrity: {
    black_dragon_queue_has_no_shadow_leak:
      !containsShadowLeak(blackDragonData.queue),

    black_dragon_responses_have_no_shadow_leak:
      !containsShadowLeak(blackDragonData.responses),

    black_dragon_adaptive_has_no_shadow_leak:
      !containsShadowLeak(blackDragonData.adaptive),

    black_dragon_dashboard_has_no_shadow_leak:
      !containsShadowLeak(blackDragonData.dashboard)
  },

  shadow_fixture_integrity: {
    shadow_queue_contains_shadow_marker:
      containsShadowLeak(shadowData.queue),

    shadow_responses_contains_shadow_marker:
      containsShadowLeak(shadowData.responses),

    shadow_adaptive_contains_shadow_marker:
      containsShadowLeak(shadowData.adaptive)
  }
};

audit.pass =
  Object.values(audit.file_checks).every(Boolean) &&
  Object.values(audit.matrix_integrity).every(Boolean) &&
  Object.values(audit.policy_integrity).every(Boolean) &&
  Object.values(audit.black_dragon_scope_integrity).every(Boolean) &&
  Object.values(audit.shadow_fixture_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_033_multiclient_isolation_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
