const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/scored_targets.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/top_targets_shortlist.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function main() {
  console.log("[BD SHORTLIST] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD SHORTLIST] Missing input: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const shortlist = targets.slice(0, 25).map((t, index) => ({
    rank: index + 1,
    master_id: t.master_id,
    agency_name: t.agency_name,
    city: t.city,
    state: t.state,
    agency_type: t.agency_type,
    authority_type: t.authority_type,
    website: t.website || "",
    contact_url: t.contact_url || "",
    priority_band: t.priority_band,
    final_score: t.phase3_scores?.final_score ?? null,
    revenue_potential: t.phase3_scores?.revenue_potential ?? null,
    training_fit: t.phase3_scores?.training_fit ?? null,
    actionability: t.phase3_scores?.actionability ?? null,
    strategic_credibility: t.phase3_scores?.strategic_credibility ?? null,
    outreach_angle: t.outreach_angle,
    shortlist_status: "ready_for_contact_enrichment"
  }));

  const output = {
    source: "black_dragon_phase3_shortlist",
    generated_at: new Date().toISOString(),
    note: "Shortlist is an action view only. It does not reduce or modify the full target pool.",
    full_target_pool_count: targets.length,
    shortlist_count: shortlist.length,
    targets: shortlist
  };

  writeJson(OUTPUT, output);

  console.log("[BD SHORTLIST] Full target pool:", targets.length);
  console.log("[BD SHORTLIST] Shortlist:", shortlist.length);
  console.log("[BD SHORTLIST] Output:", OUTPUT);
}

main();
