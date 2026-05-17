const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const REGISTRY_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json"
);

const OUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/multi_state_candidate_agencies.json"
);

const CACHE_DIR = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_cache/multi_state"
);

const ACTIVE_STATES = new Set(["CA", "TX", "FL", "GA"]);

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
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAgencyName(line) {
  return String(line || "")
    .replace(/\s+/g, " ")
    .replace(/^[^A-Z0-9]+/i, "")
    .replace(/[^A-Z0-9)&.\-\/ ]+$/i, "")
    .trim();
}

function looksLikeAgency(line) {
  const text = String(line || "").toUpperCase();

  if (text.length < 8 || text.length > 140) return false;

  if (
    text.includes("POLICE DEPARTMENT") ||
    text.includes("SHERIFF") ||
    text.includes("PUBLIC SAFETY") ||
    text.includes("CAMPUS POLICE") ||
    text.includes("TRIBAL POLICE")
  ) {
    if (
      text.includes("COURT") ||
      text.includes("PROSECUTOR") ||
      text.includes("CLERK") ||
      text.includes("SUBSCRIBE") ||
      text.includes("COPYRIGHT") ||
      text.includes("PRIVACY POLICY")
    ) {
      return false;
    }

    return true;
  }

  return false;
}

function extractCandidateAgencies(html, stateCode, source) {
  const text = cleanText(html);

  const rawParts = text
    .split(/(?=(?:[A-Z][A-Z .'\-]+(?:POLICE DEPARTMENT|SHERIFF|PUBLIC SAFETY|CAMPUS POLICE|TRIBAL POLICE)))/g)
    .map(normalizeAgencyName)
    .filter(Boolean);

  const candidates = [];
  const seen = new Set();

  for (const part of rawParts) {
    const maybe = part.slice(0, 140).trim();

    if (!looksLikeAgency(maybe)) continue;

    const key = maybe.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      state: stateCode,
      agency_name: maybe,
      source_url: source.url,
      source_type: source.type,
      status: "CANDIDATE_REVIEW_REQUIRED",
      contact_status: "NOT_VERIFIED",
      outreach_allowed: false,
      notes: "Extracted from verified official source. Requires manual verification before contact use."
    });
  }

  return candidates;
}

async function fetchSource(source, stateCode) {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": "Umbra-Nexus-Source-Verification/1.0"
    }
  });

  const body = await res.text();

  const cachePath = path.join(
    CACHE_DIR,
    `${stateCode}_${source.type}_${Date.now()}.html`
      .replace(/[^a-z0-9_.-]/gi, "_")
  );

  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, body);

  return {
    ok: res.ok,
    status: res.status,
    url: source.url,
    cache_path: cachePath,
    body
  };
}

async function main() {
  const registry = readJson(REGISTRY_PATH);

  const states = registry.states.filter(state =>
    ACTIVE_STATES.has(state.state_code) &&
    Array.isArray(state.sources) &&
    state.sources.length > 0
  );

  const output = {
    version: "black_dragon_multi_state_candidate_agencies_v1",
    generated_at: new Date().toISOString(),
    rule: "Candidate agencies only. No outreach-ready contacts are produced by this parser.",
    active_states: states.map(s => s.state_code),
    states: [],
    candidates: []
  };

  for (const state of states) {
    console.log("[PARSER] State:", state.state_code);

    const stateReport = {
      state_code: state.state_code,
      state_name: state.state_name,
      sources_checked: 0,
      sources_ok: 0,
      candidates_found: 0,
      errors: []
    };

    for (const source of state.sources) {
      stateReport.sources_checked++;

      try {
        const fetched = await fetchSource(source, state.state_code);
console.log("[DEBUG FETCH]", state.state_code, source.url, fetched.status);
console.log("[DEBUG FETCH]", state.state_code, source.url, fetched.status);

        if (!fetched.ok) {
          stateReport.errors.push({
            source_url: source.url,
            error: `HTTP ${fetched.status}`
          });
          continue;
        }

        stateReport.sources_ok++;

        const candidates = extractCandidateAgencies(
          fetched.body,
          state.state_code,
          source
        );

        stateReport.candidates_found += candidates.length;
        output.candidates.push(...candidates);

      } catch (err) {
        stateReport.errors.push({
          source_url: source.url,
          error: err.message
        });
      }
    }

    output.states.push(stateReport);
  }

  output.total_candidates = output.candidates.length;

  writeJson(OUT_PATH, output);

  console.log("[PARSER] COMPLETE");
  console.log("[PARSER] States:", output.states.length);
  console.log("[PARSER] Candidates:", output.total_candidates);
  console.log("[PARSER] Output:", OUT_PATH);
}

main().catch(err => {
  console.error("[PARSER] FAILED", err);
  process.exit(1);
});
