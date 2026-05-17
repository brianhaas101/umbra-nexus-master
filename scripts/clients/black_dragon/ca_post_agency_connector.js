const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json");
const OUT_PATH = path.join(ROOT, "public/data/clients/black_dragon/state_candidates/ca_candidate_agencies.json");
const CACHE_DIR = path.join(ROOT, "public/data/clients/black_dragon/source_cache/states/ca");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function cleanText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function isAllowedAgencyName(name) {
  const n = String(name || "").toUpperCase();

  if (n.length < 8 || n.length > 120) return false;

  if (
    n.includes("DISTRICT ATTORNEY") ||
    n.includes("CORONER") ||
    n.includes("COURT") ||
    n.includes("PROSECUTOR") ||
    n.includes("ASSOCIATION") ||
    n.includes("FEDERAL") ||
    n.includes("INTERNATIONAL")
  ) {
    return false;
  }

  return (
    n.includes("POLICE DEPARTMENT") ||
    n.includes("SHERIFF") ||
    n.includes("CAMPUS POLICE") ||
    n.includes("PUBLIC SAFETY") ||
    n.includes("TRIBAL POLICE")
  );
}

function extractCandidates(html, source) {
  const text = cleanText(html);
  const lines = text
    .split("\n")
    .map(x => x.trim())
    .filter(Boolean);

  const candidates = [];
  const seen = new Set();

  for (const line of lines) {
    const cleaned = line
      .replace(/\(not a POST participating agency\)/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!isAllowedAgencyName(cleaned)) continue;

    const key = cleaned.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      state: "CA",
      agency_name: cleaned,
      source_url: source.url,
      source_type: source.type,
      status: "CANDIDATE_REVIEW_REQUIRED",
      contact_status: "NOT_VERIFIED",
      outreach_allowed: false,
      notes: "Extracted from official CA POST law-enforcement agency list. Requires manual verification before contact use."
    });
  }

  return candidates;
}

async function main() {
  const registry = readJson(REGISTRY_PATH);
  const ca = registry.states.find(s => s.state_code === "CA");

  if (!ca || !Array.isArray(ca.sources) || ca.sources.length === 0) {
    throw new Error("CA source not active in registry.");
  }

  const source = ca.sources.find(s => s.type === "CA_POST_LE_AGENCIES") || ca.sources[0];

  if (!source.verified) {
    throw new Error("CA source is not verified.");
  }

  const response = await fetch(source.url, {
    headers: { "User-Agent": "Umbra-Nexus-CA-Connector/1.0" }
  });

  const body = await response.text();

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = path.join(CACHE_DIR, `ca_post_le_agencies_${Date.now()}.html`);
  fs.writeFileSync(cachePath, body);

  if (!response.ok) {
    throw new Error(`CA POST fetch failed: HTTP ${response.status}`);
  }

  const candidates = extractCandidates(body, source);

  const output = {
    version: "black_dragon_ca_candidate_agencies_v1",
    generated_at: new Date().toISOString(),
    state: "CA",
    source_url: source.url,
    cache_path: cachePath,
    total_candidates: candidates.length,
    rule: "Candidate agencies only. No outreach-ready contacts are produced by this connector.",
    candidates
  };

  writeJson(OUT_PATH, output);

  console.log("[CA CONNECTOR] COMPLETE");
  console.log("[CA CONNECTOR] Candidates:", candidates.length);
  console.log("[CA CONNECTOR] Output:", OUT_PATH);
}

main().catch(err => {
  console.error("[CA CONNECTOR] FAILED", err.message);
  process.exit(1);
});
