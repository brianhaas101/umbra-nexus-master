// scripts/connectors/black_dragon_ny_dcjs_connector.js
// Fetch/cache NY DCJS Criminal Justice Agencies dataset.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ny_dcjs_criminal_justice_agencies";

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const manifestPath = path.join(cacheDir, "state_directory_manifest.json");
const cachePath = path.join(cacheDir, `${SOURCE_ID}.cache.json`);

const API_URL =
  "https://data.ny.gov/resource/gugp-n5ip.json?$limit=50000";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "UmbraNexus-BlackDragon/1.0",
            Accept: "application/json"
          }
        },
        (res) => {
          let body = "";

          res.on("data", (chunk) => {
            body += chunk;
          });

          res.on("end", () => {
            if (res.statusCode !== 200) {
              return reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
            }

            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(new Error(`Invalid JSON: ${err.message}`));
            }
          });
        }
      )
      .on("error", reject);
  });
}

function updateManifest(status) {
  if (!fs.existsSync(manifestPath)) return;

  const manifest = readJson(manifestPath);
  const now = new Date().toISOString();

  manifest.sources = (manifest.sources || []).map((src) => {
    if (src.source_id !== SOURCE_ID) return src;

    return {
      ...src,
      cache_status: status.ok ? "source_cached" : "cache_failed",
      fetch_status: status.ok ? "fetched" : "fetch_failed",
      cache_file: status.ok ? `state_directories/${SOURCE_ID}.cache.json` : null,
      last_checked: now,
      error: status.error || null,
      record_count: status.record_count || 0
    };
  });

  manifest.updated_at = now;
  writeJson(manifestPath, manifest);
}

async function main() {
  console.log("[NY DCJS] Starting connector...");

  fs.mkdirSync(cacheDir, { recursive: true });

  try {
    console.log("[NY DCJS] Fetching:", API_URL);

    const records = await fetchJson(API_URL);

    if (!Array.isArray(records)) {
      throw new Error("NY DCJS response was not an array.");
    }

    const output = {
      source_id: SOURCE_ID,
      state: "NY",
      source_name: "New York Directory of Criminal Justice Agencies",
      source_url: "https://data.ny.gov/Public-Safety/Directory-of-Criminal-Justice-Agencies/gugp-n5ip",
      api_url: API_URL,
      cached_at: new Date().toISOString(),
      record_count: records.length,
      records
    };

    writeJson(cachePath, output);

    updateManifest({
      ok: true,
      record_count: records.length
    });

    console.log("[NY DCJS] Cached records:", records.length);
    console.log("[NY DCJS] Cache:", cachePath);
  } catch (err) {
    const error = err.message || String(err);

    updateManifest({
      ok: false,
      error
    });

    console.error("[NY DCJS] Failed:", error);
    process.exit(1);
  }
}

main();