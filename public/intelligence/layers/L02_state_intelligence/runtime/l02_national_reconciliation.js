import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = "C:/Dev/Nexus_MASTER";

const l02 = path.join(
  root,
  "public",
  "intelligence",
  "layers",
  "L02_state_intelligence"
);

const matrixPath = path.join(
  l02,
  "schemas",
  "state_coverage_matrix.json"
);

const registryPath = path.join(
  l02,
  "source_registry.json"
);

const reportPath = path.join(
  l02,
  "freeze",
  "L02_national_reconciliation_report.json"
);

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;

  return JSON.parse(
    fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")
  );
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const matrix = readJson(matrixPath, {
  targets: [],
  total_targets_created: 0
});

const registry = readJson(registryPath, {
  sources: [],
  active_sources: 0,
  source_count: 0,
  client_paths_touched: false
});

assert(
  matrix.total_targets_created === 750 ||
  matrix.targets.length === 750,
  "Matrix must contain exactly 750 targets."
);

const activeSources = Array.isArray(registry.sources)
  ? registry.sources.filter(source =>
      source.connector_active === true &&
      source.normalizer_active === true &&
      source.synthetic_url !== true &&
      source.inferred_contact !== true &&
      source.client_paths_touched === false &&
      typeof source.source_id === "string" &&
      typeof source.state_code === "string"
    )
  : [];

const activeKeys = new Set(
  activeSources.map(
    source => `${source.state_code}:${source.source_id}`
  )
);

const unresolvedTargets = [];

for (const target of matrix.targets) {

  const key = `${target.state_code}:${target.category}`;

  if (!activeKeys.has(key)) {

    unresolvedTargets.push({
      target_id: target.target_id,
      state_code: target.state_code,
      state_name: target.state_name,
      category: target.category,
      unresolved_key: key,
      activation_required: true,
      verified: false,
      client_paths_touched: false
    });

  }

}

const states = [...new Set(
  matrix.targets.map(target => target.state_code)
)];

const stateSummary = states.map(stateCode => {

  const stateTargets = matrix.targets.filter(
    target => target.state_code === stateCode
  );

  const stateUnresolved = unresolvedTargets.filter(
    target => target.state_code === stateCode
  );

  return {
    state_code: stateCode,
    total_targets: stateTargets.length,
    unresolved_targets: stateUnresolved.length,
    resolved_targets: stateTargets.length - stateUnresolved.length,
    completion_ratio:
      stateTargets.length === 0
        ? 0
        : (
            (stateTargets.length - stateUnresolved.length) /
            stateTargets.length
          ),
    complete: stateUnresolved.length === 0,
    client_paths_touched: false
  };

});

const reconciliation = {
  reconciliation_id: "L02_national_reconciliation",
  version: "1.0.0",
  total_required_targets: 750,
  active_verified_targets: activeSources.length,
  unresolved_targets: unresolvedTargets.length,
  resolved_targets: 750 - unresolvedTargets.length,
  completion_ratio:
    (750 - unresolvedTargets.length) / 750,
  fully_complete: unresolvedTargets.length === 0,
  unresolved_target_manifest_hash:
    sha256(unresolvedTargets),
  unresolved_targets,
  state_summary: stateSummary,
  client_paths_touched: false
};

fs.writeFileSync(
  reportPath,
  JSON.stringify(reconciliation, null, 2)
);

console.log("L02_NATIONAL_RECONCILIATION_PASS");