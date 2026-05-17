const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/top_targets_shortlist.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/top_targets_contact_enriched.json"
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

function safeUrl(url) {
  const u = clean(url);
  if (!u) return "";
  try {
    return new URL(u).toString();
  } catch {
    return "";
  }
}

function contactCandidates(website) {
  const base = safeUrl(website);
  if (!base) return [];

  const u = new URL(base);
  const root = u.origin;

  return [
    root + "/contact",
    root + "/contact-us",
    root + "/directory",
    root + "/departments",
    root + "/staff",
    root + "/police",
    root + "/sheriff",
    root + "/attorney",
    root + "/court",
    root + "/public-safety"
  ];
}

function recommendedContactRole(target) {
  const name = clean(target.agency_name);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) {
    return "task force commander / training coordinator / operations contact";
  }

  if (/SHERIFF/i.test(name)) {
    return "sheriff office administration / training coordinator / command staff";
  }

  if (/POLICE|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) {
    return "training coordinator / public information officer / command staff";
  }

  if (/PROSECUTOR|ATTORNEY/i.test(name)) {
    return "county attorney office administration / public information contact";
  }

  if (/COURT/i.test(name)) {
    return "court administrator / clerk administration";
  }

  return "agency administration / public information contact";
}

function outreachMethod(target) {
  if (target.contact_url) return "contact_form_or_listed_contact";
  if (target.website) return "website_contact_research";
  return "manual_research_required";
}

function main() {
  console.log("[BD CONTACT ENRICH] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD CONTACT ENRICH] Missing input: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const enriched = targets.map((t) => ({
    ...t,
    contact_enrichment: {
      enrichment_status: "manual_review_required",
      recommended_contact_role: recommendedContactRole(t),
      preferred_outreach_method: outreachMethod(t),
      primary_website: safeUrl(t.website),
      existing_contact_url: safeUrl(t.contact_url),
      likely_contact_pages: contactCandidates(t.website),
      email_status: "not_found_yet",
      discovered_emails: [],
      phone_status: "not_found_yet",
      discovered_phones: [],
      notes: [
        "Contact enrichment generated from official website URL where available.",
        "Do not send outreach until contact page, email, or agency-specific public contact is verified."
      ]
    }
  }));

  const output = {
    source: "black_dragon_phase3_contact_enrichment",
    generated_at: new Date().toISOString(),
    note: "Contact enrichment is additive only. It does not modify targets_master.json, scored_targets.json, or top_targets_shortlist.json.",
    shortlist_count: enriched.length,
    targets: enriched
  };

  writeJson(OUTPUT, output);

  console.log("[BD CONTACT ENRICH] Enriched:", enriched.length);
  console.log("[BD CONTACT ENRICH] Output:", OUTPUT);
}

main();
