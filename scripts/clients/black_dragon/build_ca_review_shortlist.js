const fs = require("fs");
const path = require("path");

const IN_PATH = "public/data/clients/black_dragon/state_candidates/ca_candidate_agencies.json";
const OUT_PATH = "public/data/clients/black_dragon/state_candidates/ca_review_shortlist.json";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function cleanName(name) {
  return String(name || "")
    .replace(/\(see$/i, "")
    .replace(/\(see\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBadCandidate(name) {
  const n = String(name || "").toUpperCase();

  if (!n) return true;
  if (n.includes("DEPARTMENTS") && !n.includes("POLICE DEPARTMENT")) return true;
  if (n.includes("AMTRAK")) return true;
  if (n.includes("UNIFIED SCHOOL DISTRICT")) return true;
  if (n.includes("DISTRICT POLICE") && !n.includes("COMMUNITY COLLEGE")) return true;
  if (n.includes("SEE ")) return true;
  if (n.endsWith("(SEE")) return true;

  return false;
}

function scoreAgency(name) {
  const n = String(name || "").toUpperCase();
  let score = 0;

  if (n.includes("POLICE DEPARTMENT")) score += 50;
  if (n.includes("SHERIFF")) score += 45;
  if (n.includes("COMMUNITY COLLEGE")) score += 10;
  if (n.includes("CAMPUS POLICE")) score += 10;
  if (n.includes("COUNTY")) score += 8;

  if (n.includes("LOS ANGELES")) score += 25;
  if (n.includes("SAN DIEGO")) score += 25;
  if (n.includes("SAN JOSE")) score += 25;
  if (n.includes("SAN FRANCISCO")) score += 25;
  if (n.includes("SACRAMENTO")) score += 20;
  if (n.includes("OAKLAND")) score += 20;
  if (n.includes("FRESNO")) score += 20;
  if (n.includes("ANAHEIM")) score += 15;
  if (n.includes("LONG BEACH")) score += 15;
  if (n.includes("RIVERSIDE")) score += 15;
  if (n.includes("STOCKTON")) score += 15;
  if (n.includes("BAKERSFIELD")) score += 15;

  return score;
}

function main() {
  const input = readJson(IN_PATH);
  const candidates = input.candidates || [];

  const seen = new Set();
  const cleaned = [];

  for (const c of candidates) {
    const agency_name = cleanName(c.agency_name);

    if (isBadCandidate(agency_name)) continue;

    const key = agency_name.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleaned.push({
      ...c,
      agency_name,
      review_score: scoreAgency(agency_name),
      review_status: "REVIEW_REQUIRED",
      manual_verification_required: true,
      outreach_allowed: false
    });
  }

  cleaned.sort((a, b) => b.review_score - a.review_score || a.agency_name.localeCompare(b.agency_name));

  const output = {
    version: "black_dragon_ca_review_shortlist_v1",
    generated_at: new Date().toISOString(),
    state: "CA",
    source: IN_PATH,
    total_input: candidates.length,
    total_review_candidates: cleaned.length,
    top_review_batch_size: 25,
    rule: "Review shortlist only. No outreach-ready contacts. Manual official-source verification required.",
    targets: cleaned.slice(0, 25),
    all_review_candidates: cleaned
  };

  writeJson(OUT_PATH, output);

  console.log("[CA REVIEW] COMPLETE");
  console.log("[CA REVIEW] Input:", candidates.length);
  console.log("[CA REVIEW] Clean review candidates:", cleaned.length);
  console.log("[CA REVIEW] Top batch:", output.targets.length);
  console.log("[CA REVIEW] Output:", OUT_PATH);
}

main();
