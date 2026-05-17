const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function norm(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/\b(california|long beach|southern california|audience|online|community|events|event)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const candidates = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/automation/simulation/candidates/weekly_discovery_candidates_long_beach.json"),
  "utf8"
));

const runtime = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"),
  "utf8"
));

const existing = new Set(runtime.merged_entities.map(e => norm(e.organization_name)));

const checked = candidates.candidates.map(c => {
  const key = norm(c.organization_name);
  const duplicate = existing.has(key);

  return {
    ...c,
    normalized_key: key,
    duplicate_of_existing_runtime: duplicate,
    duplicate_status: duplicate ? "DUPLICATE_REVIEW" : "NEW_CANDIDATE",
    runtime_promotion_allowed: false,
    contact_ready: false,
    automated_outreach_allowed: false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/simulation/dedupe/weekly_candidate_dedupe_results.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_weekly_candidate_dedupe_results_v1",
  generated_at: new Date().toISOString(),
  total_checked: checked.length,
  new_candidates: checked.filter(c => c.duplicate_status === "NEW_CANDIDATE").length,
  duplicate_review: checked.filter(c => c.duplicate_status === "DUPLICATE_REVIEW").length,
  candidates: checked
}, null, 2));

console.log(JSON.stringify({
  status: "WEEKLY_CANDIDATE_DEDUPE_COMPLETE",
  total_checked: checked.length,
  new_candidates: checked.filter(c => c.duplicate_status === "NEW_CANDIDATE").length,
  duplicate_review: checked.filter(c => c.duplicate_status === "DUPLICATE_REVIEW").length,
  output: out
}, null, 2));
