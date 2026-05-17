// scripts/black_dragon_ingest_sources.js
// Controlled Black Dragon source ingestion shell.
// V1: loads approved registry, creates cache manifest, does NOT fabricate leads.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const registryPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_source_registry.v1.json"
);

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache"
);

const manifestPath = path.join(cacheDir, "source_cache_manifest.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function main() {
  console.log("[INGEST] Starting...");

  if (!fs.existsSync(registryPath)) {
    throw new Error(`Missing source registry: ${registryPath}`);
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  const registry = readJson(registryPath);
  const sources = Array.isArray(registry.approved_sources)
    ? registry.approved_sources
    : [];

  const manifest = {
    client_id: registry.client_id,
    generated_at: new Date().toISOString(),
    source_count: sources.length,
    policy: registry.source_policy,
    sources: sources.map((src) => ({
      source_id: src.source_id,
      name: src.name,
      source_type: src.source_type,
      source_url: src.source_url,
      access_type: src.access_type,
      refresh_cadence: src.refresh_cadence,
      creates_entities: src.creates_entities,
      enriches_entities: src.enriches_entities,
      cache_status: "not_fetched",
      cache_file: null,
      last_checked: null
    }))
  };

  writeJson(manifestPath, manifest);

  console.log("[INGEST] Manifest created.");
  console.log("[INGEST] Approved sources:", sources.length);
  console.log("[INGEST] Cache dir:", cacheDir);
  console.log("[INGEST] Manifest:", manifestPath);
}

main();