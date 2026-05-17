const fs = require("fs");
const path = require("path");

const files = {
  module:
    "public/globe/performance/adaptive_postfx_performance_mode.js",

  injection:
    "public/data/performance/adaptive_postfx_performance_injection_report.json"
};

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const moduleText = readText(files.module);
const injection = readJson(files.injection);

const audit = {
  version: "umbra_batch_049_adaptive_postfx_performance_audit_v1",
  generated_at: new Date().toISOString(),

  module_integrity: {
    defines_global:
      moduleText.includes("window.UmbraPerformanceMode"),

    binds_events:
      moduleText.includes("bindEvents"),

    disables_postfx_on_interaction:
      moduleText.includes("setPostFX(false)"),

    restores_postfx_after_idle:
      moduleText.includes("setPostFX(true)"),

    exposes_debug:
      moduleText.includes("getDebugState"),

    uses_postfx_api:
      moduleText.includes("setPostFXEnabled") &&
      moduleText.includes("getPostFXDebug")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_adaptive_postfx_performance
      )
  }
};

audit.pass =
  Object.values(audit.module_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/performance/batch_049_adaptive_postfx_performance_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
