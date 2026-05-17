const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/top_targets_contact_enriched.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/top_targets_outreach_package.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function subjectLine(target) {
  const name = clean(target.agency_name);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) {
    return "Training resource for organized-crime and enforcement awareness";
  }

  if (/POLICE|SHERIFF|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) {
    return "Public-safety training resource for your agency";
  }

  if (/PROSECUTOR|ATTORNEY|COURT/i.test(name)) {
    return "Justice-system training resource for public-safety coordination";
  }

  return "Public-safety education resource";
}

function messageBody(target) {
  const agency = clean(target.agency_name);
  const angle = clean(target.outreach_angle);
  const role = clean(target.contact_enrichment?.recommended_contact_role);

  return [
    "Hello,",
    "",
    "I’m reaching out because " + agency + " appears aligned with " + angle + ".",
    "",
    "Black Dragon has training and educational material built around motorcycle club culture, public-safety awareness, and real-world context that may be useful for agency education, officer readiness, or justice-system coordination.",
    "",
    "Would you be the right contact for reviewing this type of training resource, or is there someone in " + role + " I should direct this to?",
    "",
    "Respectfully,"
  ].join("\n");
}

function nextAction(target) {
  if (target.contact_enrichment?.existing_contact_url) {
    return "Review listed contact URL and verify correct department contact before sending.";
  }

  if (target.contact_enrichment?.likely_contact_pages?.length) {
    return "Open likely contact pages and identify public email, form, or training/admin contact.";
  }

  return "Manual contact research required before outreach.";
}

function main() {
  console.log("[BD OUTREACH PACKAGE] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD OUTREACH PACKAGE] Missing input: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const packageTargets = targets.map((t) => ({
    rank: t.rank,
    master_id: t.master_id,
    agency_name: t.agency_name,
    city: t.city,
    state: t.state,
    priority_band: t.priority_band,
    final_score: t.final_score,
    website: t.website,
    contact_url: t.contact_url,
    recommended_contact_role: t.contact_enrichment?.recommended_contact_role || "",
    preferred_outreach_method: t.contact_enrichment?.preferred_outreach_method || "",
    outreach_angle: t.outreach_angle,
    subject_line: subjectLine(t),
    draft_message: messageBody(t),
    next_action: nextAction(t),
    outreach_status: "not_sent_review_required"
  }));

  const output = {
    source: "black_dragon_phase3_outreach_package",
    generated_at: new Date().toISOString(),
    note: "Review-only outreach package. No emails have been sent.",
    outreach_count: packageTargets.length,
    targets: packageTargets
  };

  writeJson(OUTPUT, output);

  console.log("[BD OUTREACH PACKAGE] Built:", packageTargets.length);
  console.log("[BD OUTREACH PACKAGE] Output:", OUTPUT);
}

main();
