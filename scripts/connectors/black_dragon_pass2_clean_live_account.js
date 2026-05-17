const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const CITIES_INPUT = path.join(ROOT, "public/data/leads_master.json");
const BD_INPUT = path.join(ROOT, "public/data/clients/black_dragon/targets_with_dossiers.json");

const OUTPUT = path.join(ROOT, "public/data/clients/black_dragon/black_dragon_live_account.clean.json");

function readJson(file) {
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  return JSON.parse(raw);
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function rows(raw) {
  if (Array.isArray(raw)) return raw;
  return raw.targets || raw.leads || raw.data || raw.rows || [];
}

function clean(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

function isPlaceholder(row) {
  const name = clean(row.name || row.agency_name || row.title);
  return /Luxury Auto Cluster|Collector Garage Network|Executive Fleet Operator|High-Net-Worth Vehicle Owner|Performance Service Buyer/i.test(name);
}

function stableCityId(city, state) {
  const crypto = require("crypto");
  return "city_" + crypto
    .createHash("md5")
    .update(
      String(city || "").trim().toLowerCase() +
      "|" +
      String(state || "").trim().toUpperCase()
    )
    .digest("hex")
    .slice(0, 8);
}

function makeCityShellFromBaseline(row) {
  const loc = row.location || {};
  const city = clean(loc.city || row.city);
  const state = clean(loc.state || loc.region || row.state || row.region);
  const cityId = clean(row.city_id || loc.city_id) || stableCityId(city, state);

  if (!city || !state || !cityId) return null;

  return {
    record_type: "city_shell",
    entity_type: "city_shell",
    city_id: cityId,
    name: city,
    lat: Number(row.lat ?? loc.lat),
    lon: Number(row.lon ?? loc.lon),
    location: {
      city,
      region: state,
      state,
      country: loc.country || "US",
      lat: Number(row.lat ?? loc.lat),
      lon: Number(row.lon ?? loc.lon)
    },
    _live_account_source: "satellite_city_shell",
    tags: ["satellite_city_shell", "black_dragon_navigation"],
    black_dragon_dossier: null
  };
}

function key(row) {
  const loc = row.location || {};
  return [
    clean(row.agency_name || row.name).toUpperCase(),
    clean(row.city || loc.city).toUpperCase(),
    clean(row.state || loc.state || loc.region).toUpperCase()
  ].join("|");
}

function main() {
  console.log("[BD PASS 2 CLEAN] Starting...");

  const baseline = rows(readJson(CITIES_INPUT));
  const bd = rows(readJson(BD_INPUT));

  const cityShellsById = new Map();

  for (const r of baseline) {
  const shell = makeCityShellFromBaseline(r);
  if (shell && !cityShellsById.has(shell.city_id)) {
    cityShellsById.set(shell.city_id, shell);
  }
}
  const seen = new Set();
  const realTargets = [];

  for (const r of bd) {
    if (isPlaceholder(r)) continue;

    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);

    realTargets.push({
      ...r,
      _live_account_source: "black_dragon_agency_target"
    });
  }

  const outputRows = [
    ...Array.from(cityShellsById.values()),
    ...realTargets
  ];

  const withoutDossier = realTargets.filter(r => !r.black_dragon_dossier).length;

  const output = {
    source: "black_dragon_pass2_clean_live_account",
    generated_at: new Date().toISOString(),
    note: "Clean Black Dragon usable account. Keeps satellite city shells and real Black Dragon targets only. Removes all placeholder/luxury/fleet/collector baseline entities.",
    city_shell_count: cityShellsById.size,
    black_dragon_target_count: realTargets.length,
    placeholder_count: 0,
    targets_without_dossier: withoutDossier,
    total_count: outputRows.length,
    targets: outputRows
  };

  writeJson(OUTPUT, output);

  console.log("[BD PASS 2 CLEAN] City shells:", cityShellsById.size);
  console.log("[BD PASS 2 CLEAN] Real BD targets:", realTargets.length);
  console.log("[BD PASS 2 CLEAN] Targets missing dossier:", withoutDossier);
  console.log("[BD PASS 2 CLEAN] Total:", outputRows.length);
  console.log("[BD PASS 2 CLEAN] Output:", OUTPUT);
}

main();
