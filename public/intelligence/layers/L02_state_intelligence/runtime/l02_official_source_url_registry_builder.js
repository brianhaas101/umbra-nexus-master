import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const matrixPath = path.join(l02, "schemas", "state_coverage_matrix.json");
const outPath = path.join(l02, "schemas", "official_source_url_registry.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const matrix = readJson(matrixPath);

assert(matrix.total_targets_created === 750, "Matrix must contain 750 targets.");

const verifiedCaliforniaUrls = {
  "CA:state_open_data_portals": "https://data.ca.gov/",
  "CA:state_emergency_management": "https://www.caloes.ca.gov/",
  "CA:state_police_public_safety": "https://www.chp.ca.gov/",
  "CA:state_courts": "https://www.courts.ca.gov/",
  "CA:state_environmental_agency": "https://calepa.ca.gov/",
  "CA:state_transportation": "https://dot.ca.gov/",
  "CA:state_labor_workforce": "https://www.edd.ca.gov/",
  "CA:state_housing": "https://www.hcd.ca.gov/",
  "CA:state_education": "https://www.cde.ca.gov/"
};

const targets = matrix.targets.map(target => {
  const key = `${target.state_code}:${target.category}`;
  const verifiedUrl = verifiedCaliforniaUrls[key] || null;

  return Object.freeze({
    target_id: target.target_id,
    layer_id: "L02",
    state_code: target.state_code,
    state_name: target.state_name,
    category: target.category,
    source_url: verifiedUrl,
    url_status: verifiedUrl ? "verified_existing_ca_source" : "unresolved",
    connector_active: false,
    normalizer_active: false,
    discovery_required: verifiedUrl ? false : true,
    activation_required: verifiedUrl ? true : false,
    synthetic_url: false,
    inferred_contact: false,
    l01_mutation: false,
    client_paths_touched: false
  });
});

const resolved = targets.filter(t => t.source_url).length;
const unresolved = targets.length - resolved;

const registry = Object.freeze({
  registry_id: "L02_official_source_url_registry",
  version: "1.0.0",
  total_targets: targets.length,
  resolved_urls: resolved,
  unresolved_urls: unresolved,
  no_synthetic_urls: true,
  no_inferred_contacts: true,
  targets
});

fs.writeFileSync(outPath, JSON.stringify(registry, null, 2));

assert(targets.length === 750, "URL registry must contain 750 targets.");
assert(resolved === 9, `Expected 9 known CA URLs. Found ${resolved}.`);
assert(unresolved === 741, `Expected 741 unresolved targets. Found ${unresolved}.`);

console.log("L02_OFFICIAL_SOURCE_URL_REGISTRY_PASS");
