const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const clientProfile = readJson(
  "public/data/clients/black_dragon/access/client_access_profile.v1.json"
);

const founderProfile = readJson(
  "public/data/security/platform/founder_access_profile.v1.json"
);

const runtime = readText(
  "public/globe/security/access_control_runtime.js"
);

const injection = readJson(
  "public/data/clients/black_dragon/access/audit/batch_085_access_runtime_injection_report.json"
);

const audit = {
  version: "umbra_batch_085_founder_client_separation_audit_v1",
  generated_at: new Date().toISOString(),

  client_profile_integrity: {
    client_id_locked:
      clientProfile.client_id === "black_dragon",

    client_only_scope:
      clientProfile.data_scope.client_only === true,

    cross_client_read_blocked:
      clientProfile.data_scope.allow_cross_client_read === false,

    cross_client_write_blocked:
      clientProfile.data_scope.allow_cross_client_write === false,

    founder_override_blocked:
      clientProfile.data_scope.allow_founder_override === false,

    founder_admin_blocked:
      clientProfile.blocked_views.includes("FOUNDER_ADMIN"),

    client_switcher_blocked:
      clientProfile.blocked_views.includes("CLIENT_SWITCHER"),

    fake_contacts_blocked:
      clientProfile.blocked_actions.includes("generate_fake_contacts"),

    unverified_outreach_blocked:
      clientProfile.blocked_actions.includes("enable_unverified_outreach")
  },

  founder_profile_integrity: {
    founder_id:
      founderProfile.user_id === "founder_001",

    founder_override_allowed:
      founderProfile.data_scope.allow_founder_override === true,

    cross_client_read_allowed:
      founderProfile.data_scope.allow_cross_client_read === true,

    cross_client_write_allowed:
      founderProfile.data_scope.allow_cross_client_write === true
  },

  runtime_integrity: {
    global_present:
      runtime.includes("window.UmbraAccessControl"),

    can_present:
      runtime.includes("function can"),

    can_view_present:
      runtime.includes("function canView"),

    client_scope_present:
      runtime.includes("function requireClientScope"),

    switch_guard_present:
      runtime.includes("switch_to_founder"),

    debug_present:
      runtime.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r => r.has_access_control_runtime)
  }
};

audit.pass =
  Object.values(audit.client_profile_integrity).every(Boolean) &&
  Object.values(audit.founder_profile_integrity).every(Boolean) &&
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/access/audit/batch_085_founder_client_separation_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
