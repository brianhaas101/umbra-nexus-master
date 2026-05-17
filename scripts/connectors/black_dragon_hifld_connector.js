// scripts/connectors/black_dragon_hifld_connector.js
// HIFLD Local Law Enforcement Locations connector.
// V3: caches approved source metadata and fetches ArcGIS REST GeoJSON.
// It does NOT fabricate leads and does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const registryPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_source_registry.v1.json"
);

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache"
);

const manifestPath = path.join(cacheDir, "source_cache_manifest.json");
const cacheFile = path.join(cacheDir, `${SOURCE_ID}.cache.json`);
const geojsonFile = path.join(cacheDir, `${SOURCE_ID}.geojson`);

const QUERY_URL =
  "https://services3.arcgis.com/vljlarU2635mITsl/ArcGIS/rest/services/LocalLawEnforcement_2025/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson";

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
            "User-Agent": "UmbraNexus-SourceConnector/1.0",
            "Accept": "application/json"
          }
        },
        (response) => {
          let body = "";

          response.on("data", (chunk) => {
            body += chunk;
          });

          response.on("end", () => {
            if (response.statusCode !== 200) {
              return reject(new Error(`Fetch failed: HTTP ${response.statusCode}`));
            }

            try {
              resolve(JSON.parse(body));
            } catch (err) {
              reject(new Error(`Invalid JSON response: ${err.message}`));
            }
          });
        }
      )
      .on("error", reject);
  });
}

async function main() {
  console.log("[HIFLD] Starting connector...");

  if (!fs.existsSync(registryPath)) {
    throw new Error(`Missing source registry: ${registryPath}`);
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  const registry = readJson(registryPath);
  const source = (registry.approved_sources || []).find(
    (src) => src.source_id === SOURCE_ID
  );

  if (!source) {
    throw new Error(`Source not found in registry: ${SOURCE_ID}`);
  }

  const cachedAt = new Date().toISOString();

  let fetchStatus = "not_fetched";
  let featureCount = 0;
  let downloadSize = 0;
  let error = null;

  try {
    console.log("[HIFLD] Fetching ArcGIS GeoJSON...");
    const geojson = await fetchJson(QUERY_URL);

    if (!geojson || geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features)) {
      throw new Error("GeoJSON response is not a valid FeatureCollection.");
    }

    featureCount = geojson.features.length;
    writeJson(geojsonFile, geojson);
    downloadSize = fs.statSync(geojsonFile).size;
    fetchStatus = "geojson_cached";

    console.log("[HIFLD] GeoJSON cached.");
    console.log("[HIFLD] Features:", featureCount);
    console.log("[HIFLD] Bytes:", downloadSize);
  } catch (err) {
    fetchStatus = "fetch_failed";
    error = String(err.message || err);
    console.warn("[HIFLD] Fetch failed:", error);
  }

  const cacheRecord = {
    source_id: SOURCE_ID,
    name: source.name,
    authority: source.authority,
    source_type: source.source_type,
    registry_source_url: source.source_url,
    query_url: QUERY_URL,
    access_type: "arcgis_rest_geojson",
    creates_entities: source.creates_entities,
    enriches_entities: source.enriches_entities,
    cached_at: cachedAt,
    status: fetchStatus === "geojson_cached" ? "source_geojson_cached" : "metadata_cached",
    fetch_status: fetchStatus,
    geojson_file: fetchStatus === "geojson_cached"
      ? `source_cache/${SOURCE_ID}.geojson`
      : null,
    feature_count: featureCount,
    download_size_bytes: downloadSize,
    entity_creation_allowed: true,
    source_policy: {
      no_placeholders: true,
      no_hypothetical_leads: true,
      public_or_authorized_sources_only: true,
      each_entity_requires_source_url: true
    },
    error,
    notes: [
      "This connector fetches HIFLD law enforcement location data through an ArcGIS REST GeoJSON query.",
      "No records are written to leads_master.json by this connector.",
      "Next step is parser review before entity creation."
    ]
  };

  writeJson(cacheFile, cacheRecord);

  if (fs.existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);

    manifest.sources = (manifest.sources || []).map((entry) => {
      if (entry.source_id !== SOURCE_ID) return entry;

      return {
        ...entry,
        cache_status: cacheRecord.status,
        cache_file: `source_cache/${SOURCE_ID}.cache.json`,
        last_checked: cachedAt,
        fetch_status: fetchStatus,
        geojson_file: cacheRecord.geojson_file,
        feature_count: featureCount,
        download_size_bytes: downloadSize
      };
    });

    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);
  }

  console.log("[HIFLD] Cache record written:", cacheFile);
  console.log("[HIFLD] Fetch status:", fetchStatus);
}

main().catch((err) => {
  console.error("[HIFLD] Fatal error:", err);
  process.exit(1);
});