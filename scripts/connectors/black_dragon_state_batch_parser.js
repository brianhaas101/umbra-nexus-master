const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const SOURCES = [
  {
    state: "AZ",
    source_id: "az_acjc_statewide_agency_directory",
    cities: [
      "Phoenix",
      "Tucson",
      "Mesa",
      "Glendale",
      "Scottsdale",
      "Chandler",
      "Tempe",
      "Peoria",
      "Surprise",
      "Yuma",
      "Flagstaff",
      "Prescott",
      "Kingman",
      "Casa Grande",
      "Sierra Vista",
      "Nogales",
      "Safford",
      "Globe",
      "Parker",
      "Holbrook",
      "Bisbee",
      "Avondale",
      "Goodyear",
      "Buckeye",
      "Gilbert",
      "Maricopa",
      "Apache Junction",
      "Lake Havasu City",
      "Bullhead City",
      "Show Low",
      "Cottonwood",
      "Sedona",
      "Eloy",
      "Florence",
      "Coolidge",
      "Douglas",
      "Willcox"
    ]
  },
  {
    state: "IL",
    source_id: "il_sheriffs_association_directory",
    cities: ["Chicago"]
  },
  {
    state: "OH",
    source_id: "oh_ag_law_enforcement_directory",
    cities: ["Columbus"]
  },
  {
    state: "NC",
    source_id: "nc_cjin_law_enforcement_agencies",
    cities: ["Charlotte", "Raleigh"]
  }
];

function clean(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<\/th>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function absoluteUrl(url, baseUrl) {
  const u = String(url || "").trim();
  if (!u) return "";

  try {
    if (/^https?:\/\//i.test(u)) return u;
    return new URL(u, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractLinks(html, source) {
  const links = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = re.exec(html))) {
    const href = match[1];
    const label = clean(match[2]);

    if (!label || label.length < 3) continue;

    links.push({
      label,
      url: absoluteUrl(href, source.base_url)
    });
  }

  return links;
}

function extractTextLines(html) {
  const text = clean(html);

  const directLines = text
    .split("\n")
    .map(clean)
    .filter((line) => line.length >= 5);

  const splitLines = text
    .split(/(?=\b[A-Z][A-Za-z .'-]+(?:Police|Sheriff|Marshal|Constable|Public Safety|Department|Office)\b)/i)
    .map(clean)
    .filter((line) => line.length >= 5);

  return [...directLines, ...splitLines];
}

function extractAzDirectoryCards(html, source) {
  const cards = [];
  const re = /<div class=["']mycolumn["'][^>]*>([\s\S]*?)<\/div>/gi;
  let match;

  while ((match = re.exec(html))) {
    const block = match[1];

    const nameMatch = block.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
    if (!nameMatch) continue;

    const agencyName = normalizeAgencyName(nameMatch[1]);

    const websiteMatch = block.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*Visit Website\s*<\/a>/i);
    const website = websiteMatch ? absoluteUrl(websiteMatch[1], source.base_url) : "";

    const blockText = clean(block);
    const cityMatch = blockText.match(/\b([A-Za-z .'-]+),\s*AZ\s+\d{5}\b/i);
    const city = cityMatch ? cityMatch[1].trim() : "";

    if (!agencyName || agencyName.length < 4) continue;

    cards.push({
      agency_name: agencyName,
      city,
      website,
      contact_url: website,
      extraction_method: "az_mycolumn_card"
    });
  }

  return cards;
}

function candidateCity(text, cities, state) {
  const t = clean(text).toUpperCase();

  for (const city of cities) {
    if (t.includes(city.toUpperCase())) return city;
  }

  if (state === "AZ") {
    if (t.includes("MARICOPA")) return "Phoenix";
    if (t.includes("PIMA")) return "Tucson";
    if (t.includes("PINAL")) return "Casa Grande";
    if (t.includes("YAVAPAI")) return "Prescott";
    if (t.includes("COCONINO")) return "Flagstaff";
    if (t.includes("MOHAVE")) return "Kingman";
    if (t.includes("YUMA")) return "Yuma";
    if (t.includes("COCHISE")) return "Bisbee";
    if (t.includes("NAVAJO")) return "Holbrook";
    if (t.includes("APACHE")) return "St. Johns";
    if (t.includes("GILA")) return "Globe";
    if (t.includes("GRAHAM")) return "Safford";
    if (t.includes("GREENLEE")) return "Clifton";
    if (t.includes("LA PAZ")) return "Parker";
    if (t.includes("SANTA CRUZ")) return "Nogales";
  }

  if (state === "IL" && t.includes("COOK")) return "Chicago";

  if (state === "OH" && t.includes("FRANKLIN")) return "Columbus";

  if (state === "NC" && t.includes("MECKLENBURG")) return "Charlotte";
  if (state === "NC" && t.includes("WAKE")) return "Raleigh";

  return "";
}

function looksLikeAgency(text) {
  const t = clean(text).toUpperCase();

  const hasAgencySignal =
    /\bPOLICE\b/.test(t) ||
    /\bSHERIFF\b/.test(t) ||
    /\bMARSHAL\b/.test(t) ||
    /\bCONSTABLE\b/.test(t) ||
    /\bPUBLIC SAFETY\b/.test(t) ||
    /\bLAW ENFORCEMENT\b/.test(t) ||
    /\bDEPARTMENT OF PUBLIC SAFETY\b/.test(t) ||
    /\bDPS\b/.test(t) ||
    /\bPROSECUTOR\b/.test(t) ||
    /\bATTORNEY\b/.test(t) ||
    /\bCOURT\b/.test(t) ||
    /\bHIDTA\b/.test(t) ||
    /\bTASK FORCE\b/.test(t) ||
    /\bTRIBAL POLICE\b/.test(t);

  if (!hasAgencySignal) return false;

  const badSignals =
    /\bLOGIN\b|\bSEARCH\b|\bMENU\b|\bFACEBOOK\b|\bTWITTER\b|\bINSTAGRAM\b|\bLINKEDIN\b|\bYOUTUBE\b|\bNEWS\b|\bPRESS RELEASE\b|\bPRIVACY\b|\bTERMS\b|\bFOIA\b|\bCOPYRIGHT\b|\bACCESSIBILITY\b/i;

  return !badSignals.test(t);
}

function normalizeAgencyName(text) {
  let name = clean(text);

  name = name
    .replace(/\bContact\b.*$/i, "")
    .replace(/\bWebsite\b.*$/i, "")
    .replace(/\bPhone\b.*$/i, "")
    .replace(/\bEmail\b.*$/i, "")
    .replace(/\bFax\b.*$/i, "")
    .replace(/\bAddress\b.*$/i, "")
    .replace(/\s+-\s+.*$/i, "")
    .replace(/\s+\|\s+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return name;
}

function classifyAgency(name) {
  const t = clean(name).toUpperCase();

  if (/\bSHERIFF\b/.test(t)) return "county_sheriff";
  if (/\bTRIBAL POLICE\b/.test(t)) return "tribal_police";
  if (/\bCONSTABLE\b/.test(t)) return "constable";
  if (/\bMARSHAL\b/.test(t)) return "marshal";
  if (/\bHIDTA\b|\bTASK FORCE\b/.test(t)) return "task_force";
  if (/\bPROSECUTOR\b|\bATTORNEY\b/.test(t)) return "prosecutor_attorney";
  if (/\bCOURT\b/.test(t)) return "court";
  if (/\bPUBLIC SAFETY\b|\bDPS\b|\bDEPARTMENT OF PUBLIC SAFETY\b/.test(t)) return "public_safety";
  if (/\bPOLICE\b/.test(t)) return "municipal_police";

  return "justice_public_safety_related";
}

function confidenceForCandidate(item, city) {
  let score = 0.62;

  if (item.website) score += 0.08;
  if (item.contact_url) score += 0.05;
  if (city) score += 0.1;
  if (/\bPolice Department\b|\bSheriff/i.test(item.agency_name)) score += 0.08;

  return Math.min(Number(score.toFixed(2)), 0.9);
}

function dedupeKey(agencyName, city, state) {
  return `${agencyName}|${city}|${state}`
    .toUpperCase()
    .replace(/[^A-Z0-9|]/g, "");
}

function parseSource(source) {
  const htmlPath = path.resolve(
    ROOT,
    `public/data/clients/black_dragon/source_cache/state_directories/${source.source_id}.html`
  );

  const outPath = path.resolve(
    ROOT,
    `public/data/clients/black_dragon/source_cache/state_directories/${source.source_id}.candidates.json`
  );

  if (!fs.existsSync(htmlPath)) {
  console.warn(`[STATE BATCH PARSER] Missing HTML: ${htmlPath}`);
  return;
}

  const html = fs.readFileSync(htmlPath, "utf8");

  source.base_url =
    source.source_id.includes("az_") ? "https://www.azcjc.gov" :
    source.source_id.includes("il_") ? "https://www.ilsheriff.org" :
    source.source_id.includes("oh_") ? "https://www.ohioattorneygeneral.gov" :
    source.source_id.includes("nc_") ? "https://cjin.nc.gov" :
    "https://example.com";

  const rawItems =
    source.state === "AZ"
      ? extractAzDirectoryCards(html, source)
      : [
          ...extractLinks(html, source).map((x) => ({
            agency_name: normalizeAgencyName(x.label),
            website: x.url,
            contact_url: x.url,
            extraction_method: "link"
          })),
          ...extractTextLines(html).map((line) => ({
            agency_name: normalizeAgencyName(line),
            website: "",
            contact_url: "",
            extraction_method: "text"
          }))
        ];

  const seen = new Set();
  const candidates = [];

  for (const item of rawItems) {
    const agencyName = normalizeAgencyName(item.agency_name);

    if (!agencyName || agencyName.length < 5) continue;
    if (!looksLikeAgency(agencyName)) continue;

    const city = candidateCity(agencyName, source.cities, source.state);

    if (!city && source.state !== "AZ") continue;

    const key = dedupeKey(agencyName, city, source.state);
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      candidate_id: `${source.source_id}-CAND-${String(candidates.length + 1).padStart(4, "0")}`,
      source_id: source.source_id,
      state: source.state,
      city: city || "AZ_STATEWIDE_REVIEW",
      agency_name: agencyName,
      agency_type: classifyAgency(agencyName),
      website: item.website || "",
      contact_url: item.contact_url || "",
      confidence: confidenceForCandidate(item, city),
      extraction_method: item.extraction_method,
      review_status: "state_batch_review_required",
      live_import_allowed: false
    });
  }

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        source_id: source.source_id,
        state: source.state,
        generated_at: new Date().toISOString(),
        candidate_count: candidates.length,
        candidates
      },
      null,
      2
    )
  );

  console.log(`[STATE BATCH PARSER] ${source.source_id}: ${candidates.length}`);
}

function main() {
  console.log("[STATE BATCH PARSER] Starting...");
  SOURCES.forEach(parseSource);
}

main();