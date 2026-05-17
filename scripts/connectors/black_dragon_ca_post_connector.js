// scripts/connectors/black_dragon_ca_post_connector.js
// Fetch/cache California POST law enforcement agency pages.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ca_post_law_enforcement_agencies";

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const manifestPath = path.join(cacheDir, "state_directory_manifest.json");
const htmlPath = path.join(cacheDir, `${SOURCE_ID}.html`);
const cachePath = path.join(cacheDir, `${SOURCE_ID}.cache.json`);

const SOURCE_URL = "https://post.ca.gov/le-agencies";

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
      raw_html_file: status.ok ? `state_directories/${SOURCE_ID}.html` : null,
      last_checked: now,
      error: status.error || null,
      byte_count: status.byte_count || 0
    };
  });

  manifest.updated_at = now;
  writeJson(manifestPath, manifest);
}

async function main() {
  console.log("[CA POST] Starting connector...");
  fs.mkdirSync(cacheDir, { recursive: true });

  try {
    console.log("[CA POST] Fetching:", SOURCE_URL);
    const html = await fetchText(SOURCE_URL);

    fs.writeFileSync(htmlPath, html, "utf8");

    const cache = {
      source_id: SOURCE_ID,
      state: "CA",
      source_name: "California POST Law Enforcement Agencies",
      source_url: SOURCE_URL,
      cached_at: new Date().toISOString(),
      byte_count: Buffer.byteLength(html, "utf8"),
      html_file: `state_directories/${SOURCE_ID}.html`,
      live_import_allowed: false,
      notes: [
        "Raw official CA POST law enforcement agency page cached.",
        "No entities created by this connector.",
        "Parser/authority filter required before merge."
      ]
    };

    writeJson(cachePath, cache);
    updateManifest({ ok: true, byte_count: cache.byte_count });

    console.log("[CA POST] Cached bytes:", cache.byte_count);
    console.log("[CA POST] HTML:", htmlPath);
    console.log("[CA POST] Cache:", cachePath);
  } catch (err) {
    const error = err.message || String(err);
    updateManifest({ ok: false, error });
    console.error("[CA POST] Failed:", error);
    process.exit(1);
  }
}

main();