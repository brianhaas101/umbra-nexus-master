import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const registryPath = path.join(l02, "schemas", "official_source_url_registry.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJson(registryPath);

const stateDomains = {
  AL: "alabama.gov", AK: "alaska.gov", AZ: "az.gov", AR: "arkansas.gov", CA: "ca.gov",
  CO: "colorado.gov", CT: "ct.gov", DE: "delaware.gov", FL: "myflorida.com", GA: "georgia.gov",
  HI: "hawaii.gov", ID: "idaho.gov", IL: "illinois.gov", IN: "in.gov", IA: "iowa.gov",
  KS: "kansas.gov", KY: "kentucky.gov", LA: "louisiana.gov", ME: "maine.gov", MD: "maryland.gov",
  MA: "mass.gov", MI: "michigan.gov", MN: "mn.gov", MS: "ms.gov", MO: "mo.gov",
  MT: "mt.gov", NE: "nebraska.gov", NV: "nv.gov", NH: "nh.gov", NJ: "nj.gov",
  NM: "nm.gov", NY: "ny.gov", NC: "nc.gov", ND: "nd.gov", OH: "ohio.gov",
  OK: "oklahoma.gov", OR: "oregon.gov", PA: "pa.gov", RI: "ri.gov", SC: "sc.gov",
  SD: "sd.gov", TN: "tn.gov", TX: "texas.gov", UT: "utah.gov", VT: "vermont.gov",
  VA: "virginia.gov", WA: "wa.gov", WV: "wv.gov", WI: "wisconsin.gov", WY: "wyo.gov"
};

const knownOverrides = {
  "NY:state_open_data_portals": ["https://data.ny.gov/"],
  "NY:state_emergency_management": ["https://www.dhses.ny.gov/"],
  "NY:state_police_public_safety": ["https://troopers.ny.gov/"],

  "TX:state_open_data_portals": ["https://data.texas.gov/"],
  "TX:state_emergency_management": ["https://tdem.texas.gov/"],
  "TX:state_police_public_safety": ["https://www.dps.texas.gov/"],

  "FL:state_open_data_portals": ["https://openmyflorida.opendata.arcgis.com/", "https://gis-fdot.opendata.arcgis.com/"],
  "FL:state_emergency_management": ["https://www.floridadisaster.org/"],
  "FL:state_police_public_safety": ["https://www.flhsmv.gov/florida-highway-patrol/"]
};

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function candidatesFor(target) {
  const key = `${target.state_code}:${target.category}`;
  const domain = stateDomains[target.state_code];
  const stateCodeLower = target.state_code.toLowerCase();
  const stateNameSlug = slug(target.state_name);

  const candidates = [];

  if (knownOverrides[key]) candidates.push(...knownOverrides[key]);

  if (!domain) return [...new Set(candidates)];

  if (target.category === "state_open_data_portals") {
    candidates.push(
      `https://data.${domain}/`,
      `https://opendata.${domain}/`,
      `https://${stateCodeLower}.opendata.arcgis.com/`,
      `https://${stateNameSlug}.opendata.arcgis.com/`
    );
  }

  if (target.category === "state_emergency_management") {
    candidates.push(
      `https://emergency.${domain}/`,
      `https://em.${domain}/`,
      `https://disaster.${domain}/`,
      `https://www.${domain}/emergency-management/`,
      `https://www.${domain}/emergency/`
    );
  }

  if (target.category === "state_police_public_safety") {
    candidates.push(
      `https://dps.${domain}/`,
      `https://statepolice.${domain}/`,
      `https://troopers.${domain}/`,
      `https://highwaypatrol.${domain}/`,
      `https://www.${domain}/public-safety/`
    );
  }

  candidates.push(`https://www.${domain}/`);

  return [...new Set(candidates)];
}

export function buildCandidateBatch({ categories = [], state_codes = [], limit = 3 } = {}) {
  let unresolved = registry.targets.filter(t =>
    !t.source_url &&
    t.url_status === "unresolved"
  );

  if (categories.length) {
    const allowed = new Set(categories);
    unresolved = unresolved.filter(t => allowed.has(t.category));
  }

  if (state_codes.length) {
    const allowed = new Set(state_codes);
    unresolved = unresolved.filter(t => allowed.has(t.state_code));
  }

  return unresolved.slice(0, limit).map(target => Object.freeze({
    target_id: target.target_id,
    state_code: target.state_code,
    state_name: target.state_name,
    category: target.category,
    candidates: candidatesFor(target),
    candidate_urls_are_verified: false,
    promoted: false,
    registry_mutation: false,
    l01_mutation: false,
    client_paths_touched: false
  }));
}

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}`) {
  const batch = buildCandidateBatch({
    categories: [
      "state_open_data_portals",
      "state_emergency_management",
      "state_police_public_safety"
    ],
    limit: 3
  });

  console.log(JSON.stringify({
    result: "L02_HEURISTIC_RESOLVER_PASS",
    batch_size: batch.length,
    batch
  }, null, 2));
}
