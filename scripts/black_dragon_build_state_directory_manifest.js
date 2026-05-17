const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const registryPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_state_agency_directory_registry.v1.json"
);

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const manifestPath = path.join(cacheDir, "state_directory_manifest.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function main() {
  console.log("[STATE DIRECTORY MANIFEST] Starting...");

  if (!fs.existsSync(registryPath)) {
    throw new Error(`Missing registry: ${registryPath}`);
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  const registry = readJson(registryPath);
  const sources = Array.isArray(registry.approved_state_sources)
    ? registry.approved_state_sources
    : [];

  const manifest = {
    client_id: registry.client_id,
    version: "v1",
    generated_at: new Date().toISOString(),
    source_registry: "black_dragon_state_agency_directory_registry.v1.json",
    policy: registry.policy,
    coverage_goal: registry.coverage_goal,
    source_count: sources.length,
    sources: sources.map((src) => ({
      state: src.state,
      source_id: src.source_id,
      name: src.name,
      authority: src.authority,
      source_type: src.source_type,
      source_url: src.source_url,
      contact_url: src.contact_url || "",
      access_type: src.access_type,
      creates_entities: src.creates_entities,
      enriches_entities: src.enriches_entities,
      priority_for_top_50: src.priority_for_top_50,
      top_50_cities_supported: src.top_50_cities_supported || [],
      cache_status: "not_fetched",
      fetch_status: "not_started",
      cache_file: null,
      parsed_file: null,
      candidate_file: null,
      last_checked: null,
      error: null
    }))
  };

  writeJson(manifestPath, manifest);

  console.log("[STATE DIRECTORY MANIFEST] Created.");
  console.log("Sources:", manifest.source_count);
  console.log("Cache dir:", cacheDir);
  console.log("Manifest:", manifestPath);
}

main();