// scripts/connectors/black_dragon_fl_fdle_connector.js
// Fetch/cache FDLE agency website and agency address pages.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = "C:/Dev/Nexus_MASTER";

const SOURCES = [
  {
    source_id: "fl_fdle_criminal_justice_agency_websites",
    state: "FL",
    name: "Florida Criminal Justice Agency Websites",
    url: "https://www.fdle.state.fl.us/cjstc/publications/criminal-justice-agency-links"
  },
  {
    source_id: "fl_fdle_criminal_justice_agency_addresses",
    state: "FL",
    name: "Florida Criminal Justice Agency Addresses",
    url: "https://www.fdle.state.fl.us/cjstc/publications/criminal-justice-agency-addresses"
  }
];

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
  console.log("[FL FDLE] Starting connector...");
  fs.mkdirSync(cacheDir, { recursive: true });

  const results = [];

  for (const src of SOURCES) {
    const htmlPath = path.join(cacheDir, `${src.source_id}.html`);
    const cachePath = path.join(cacheDir, `${src.source_id}.cache.json`);

    try {
      console.log("[FL FDLE] Fetching:", src.url);
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
        live_import_allowed: false,
        notes: [
          "Raw official FDLE page cached.",
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

      console.log("[FL FDLE] Cached:", src.source_id, cache.byte_count);
    } catch (err) {
      const error = err.message || String(err);

      results.push({
        source_id: src.source_id,
        ok: false,
        error
      });

      console.error("[FL FDLE] Failed:", src.source_id, error);
    }
  }

  updateManifest(results);

  const failed = results.filter((r) => !r.ok);
  if (failed.length) process.exit(1);

  console.log("[FL FDLE] Done.");
}

main();