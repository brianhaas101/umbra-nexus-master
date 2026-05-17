// scripts/connectors/black_dragon_state_batch_connector.js
// Fetch/cache AZ / IL / OH / NC agency directory pages.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = "C:/Dev/Nexus_MASTER";

const SOURCES = [
  {
    state: "AZ",
    source_id: "az_acjc_statewide_agency_directory",
    name: "Arizona Criminal Justice Commission Statewide Agency Directory",
    url: "https://www.azcjc.gov/About-Us/Statewide-Agency-Directory",
    top_50_cities_supported: ["Phoenix", "Tucson", "Mesa"]
  },
  {
    state: "IL",
    source_id: "il_ptb_training_authority",
    name: "Illinois Law Enforcement Training and Standards Board",
    url: "https://www.ptb.illinois.gov/",
    top_50_cities_supported: ["Chicago"]
  },
  {
    state: "IL",
    source_id: "il_sheriffs_association_directory",
    name: "Illinois Sheriffs' Association Directory",
    url: "https://www.ilsheriff.org/sheriffs-directory/",
    top_50_cities_supported: ["Chicago"]
  },
  {
    state: "OH",
    source_id: "oh_ag_law_enforcement_directory",
    name: "Ohio Attorney General Law Enforcement Directory",
    url: "https://www.ohioattorneygeneral.gov/Law-Enforcement/Law-Enforcement-Directory",
    top_50_cities_supported: ["Columbus"]
  },
  {
    state: "NC",
    source_id: "nc_cjin_law_enforcement_agencies",
    name: "NC CJIN Law Enforcement Agencies",
    url: "https://cjin.nc.gov/law-enforcement-agencies/",
    top_50_cities_supported: ["Charlotte", "Raleigh"]
  }
];

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const registryPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_state_agency_directory_registry.v1.json"
);

const manifestPath = path.join(cacheDir, "state_directory_manifest.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "UmbraNexus-BlackDragon/1.0",
            Accept: "text/html,application/xhtml+xml"
          }
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
            }
            resolve(body);
          });
        }
      )
      .on("error", reject);
  });
}

function ensureRegistrySources() {
  if (!fs.existsSync(registryPath)) return;

  const registry = readJson(registryPath);
  const existing = new Set(
    (registry.approved_state_sources || []).map((s) => s.source_id)
  );

  let added = 0;

  for (const src of SOURCES) {
    if (existing.has(src.source_id)) continue;

    registry.approved_state_sources.push({
      state: src.state,
      source_id: src.source_id,
      name: src.name,
      authority: src.name,
      source_type: "official_or_state_backed_agency_directory",
      source_url: src.url,
      access_type: "html_directory",
      creates_entities: true,
      enriches_entities: true,
      priority_for_top_50: true,
      top_50_cities_supported: src.top_50_cities_supported,
      notes: "Added by state batch connector for top-50 city coverage expansion."
    });

    added += 1;
  }

  registry.updated_at = new Date().toISOString();

  if (added > 0) {
    writeJson(registryPath, registry);
  }

  console.log("[STATE BATCH] Registry additions:", added);
}

function ensureManifestSources() {
  if (!fs.existsSync(manifestPath)) return;

  const manifest = readJson(manifestPath);
  const existing = new Set((manifest.sources || []).map((s) => s.source_id));

  let added = 0;

  for (const src of SOURCES) {
    if (existing.has(src.source_id)) continue;

    manifest.sources.push({
      state: src.state,
      source_id: src.source_id,
      name: src.name,
      authority: src.name,
      source_type: "official_or_state_backed_agency_directory",
      source_url: src.url,
      contact_url: "",
      access_type: "html_directory",
      creates_entities: true,
      enriches_entities: true,
      priority_for_top_50: true,
      top_50_cities_supported: src.top_50_cities_supported,
      cache_status: "not_fetched",
      fetch_status: "not_started",
      cache_file: null,
      parsed_file: null,
      candidate_file: null,
      last_checked: null,
      error: null
    });

    added += 1;
  }

  manifest.source_count = manifest.sources.length;
  manifest.updated_at = new Date().toISOString();

  if (added > 0) {
    writeJson(manifestPath, manifest);
  }

  console.log("[STATE BATCH] Manifest additions:", added);
}

function updateManifest(results) {
  if (!fs.existsSync(manifestPath)) return;

  const manifest = readJson(manifestPath);
  const now = new Date().toISOString();
  const byId = new Map(results.map((r) => [r.source_id, r]));

  manifest.sources = (manifest.sources || []).map((src) => {
    const result = byId.get(src.source_id);
    if (!result) return src;

    return {
      ...src,
      cache_status: result.ok ? "source_cached" : "cache_failed",
      fetch_status: result.ok ? "fetched" : "fetch_failed",
      cache_file: result.ok ? `state_directories/${result.source_id}.cache.json` : null,
      raw_html_file: result.ok ? `state_directories/${result.source_id}.html` : null,
      last_checked: now,
      error: result.error || null,
      byte_count: result.byte_count || 0
    };
  });

  manifest.updated_at = now;
  writeJson(manifestPath, manifest);
}

async function main() {
  console.log("[STATE BATCH] Starting connector...");
  fs.mkdirSync(cacheDir, { recursive: true });

  ensureRegistrySources();
  ensureManifestSources();

  const results = [];

  for (const src of SOURCES) {
    const htmlPath = path.join(cacheDir, `${src.source_id}.html`);
    const cachePath = path.join(cacheDir, `${src.source_id}.cache.json`);

    try {
      console.log("[STATE BATCH] Fetching:", src.source_id, src.url);
      const html = await fetchText(src.url);

      fs.writeFileSync(htmlPath, html, "utf8");

      const cache = {
        source_id: src.source_id,
        state: src.state,
        source_name: src.name,
        source_url: src.url,
        cached_at: new Date().toISOString(),
        byte_count: Buffer.byteLength(html, "utf8"),
        html_file: `state_directories/${src.source_id}.html`,
        top_50_cities_supported: src.top_50_cities_supported,
        live_import_allowed: false,
        notes: [
          "Raw state directory page cached.",
          "No entities created by this connector.",
          "Parser/authority filter required before merge."
        ]
      };

      writeJson(cachePath, cache);

      results.push({
        source_id: src.source_id,
        ok: true,
        byte_count: cache.byte_count
      });

      console.log("[STATE BATCH] Cached:", src.source_id, cache.byte_count);
    } catch (err) {
      const error = err.message || String(err);

      results.push({
        source_id: src.source_id,
        ok: false,
        error
      });

      console.error("[STATE BATCH] Failed:", src.source_id, error);
    }
  }

  updateManifest(results);

  const failed = results.filter((r) => !r.ok);
  console.log("[STATE BATCH] Done. Success:", results.length - failed.length, "Failed:", failed.length);

  if (failed.length) process.exit(1);
}

main();