const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const targetsPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_major_city_targets.v1.json"
);

const websitesPath = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/agency_websites.json"
);

const outPath = targetsPath;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function norm(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function key(name, city, state) {
  return `${norm(name)}|${norm(city)}|${String(state || "").toUpperCase()}`;
}

function main() {
  console.log("[WEBSITE ENRICHMENT] Starting...");

  if (!fs.existsSync(targetsPath)) {
    throw new Error(`Missing targets file: ${targetsPath}`);
  }

  if (!fs.existsSync(websitesPath)) {
    throw new Error(`Missing agency websites file: ${websitesPath}`);
  }

  const targets = readJson(targetsPath);
  const websites = readJson(websitesPath);

  const list = Array.isArray(websites)
    ? websites
    : Array.isArray(websites.agencies)
      ? websites.agencies
      : Array.isArray(websites.websites)
        ? websites.websites
        : [];

  const websiteIndex = new Map();

  list.forEach((item) => {
    const agencyName = item.agency_name || item.name || item.agency || "";
    const city = item.city || "";
    const state = item.state || "";
    const url = item.website || item.website_url || item.contact_url || item.url || "";

    if (!agencyName || !city || !state || !url) return;

    websiteIndex.set(key(agencyName, city, state), {
      website: url,
      contact_url: item.contact_url || url,
      source_name: item.source_name || "agency_websites.json",
      source_url: item.source_url || url,
      website_verified: item.website_verified ?? true
    });
  });

  let enriched = 0;
  let alreadyHadContact = 0;
  let missing = 0;

  targets.cities.forEach((city) => {
    city.targets.forEach((target) => {
      const match = websiteIndex.get(key(target.agency_name, target.city, target.state));

      if (!match) {
        if (!target.contact_url) missing += 1;
        return;
      }

      if (target.contact_url) alreadyHadContact += 1;

      target.contact_url = match.contact_url;
      target.website = match.website;
      target.website_verified = match.website_verified;
      target.website_source_name = match.source_name;
      target.website_source_url = match.source_url;
      target.contact_enrichment_status = "website_matched";

      enriched += 1;
    });
  });

  targets.generated_at = new Date().toISOString();
  targets.website_enrichment = {
    agency_websites_file: "agency_websites.json",
    website_records_loaded: list.length,
    enriched_targets: enriched,
    already_had_contact: alreadyHadContact,
    remaining_missing_contact_url: missing,
    no_placeholders: true
  };

  writeJson(outPath, targets);

  console.log("[WEBSITE ENRICHMENT] Website records:", list.length);
  console.log("[WEBSITE ENRICHMENT] Enriched targets:", enriched);
  console.log("[WEBSITE ENRICHMENT] Remaining missing contact_url:", missing);
  console.log("[WEBSITE ENRICHMENT] Updated:", outPath);
}

main();