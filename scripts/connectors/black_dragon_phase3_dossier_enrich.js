const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const INPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/scored_targets.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/targets_with_dossiers.json"
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

function agencyClass(target) {
  const name = clean(target.agency_name);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) return "specialized_enforcement";
  if (/SHERIFF/i.test(name)) return "county_law_enforcement";
  if (/POLICE|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) return "law_enforcement_agency";
  if (/PROSECUTOR|ATTORNEY/i.test(name)) return "justice_prosecution";
  if (/COURT/i.test(name)) return "court_system";

  return "public_safety_related";
}

function recommendedContact(target) {
  const name = clean(target.agency_name);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) {
    return "Task force commander / operations lead / training coordinator";
  }

  if (/SHERIFF/i.test(name)) {
    return "Sheriff office administration / training coordinator / command staff";
  }

  if (/POLICE|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) {
    return "Training coordinator / command staff / public information officer";
  }

  if (/PROSECUTOR|ATTORNEY/i.test(name)) {
    return "County attorney administration / public information contact";
  }

  if (/COURT/i.test(name)) {
    return "Court administrator / clerk administration";
  }

  return "Agency administration / public information contact";
}

function priorityReason(target) {
  const name = clean(target.agency_name);
  const score = Number(target.phase3_scores?.final_score ?? target.final_score ?? 0);

  if (/HIDTA|TASK FORCE|DRUG|GANG|BORDER/i.test(name)) {
    return "High operational relevance due to specialized enforcement, organized-crime awareness, or task-force alignment.";
  }

  if (/SHERIFF|POLICE|PUBLIC SAFETY|DPS|TRIBAL POLICE/i.test(name)) {
    return "Strong training relevance due to direct public-safety responsibility, officer readiness needs, and agency-level education potential.";
  }

  if (/PROSECUTOR|ATTORNEY/i.test(name)) {
    return "Useful justice-system target because prosecution offices influence training context, agency coordination, and public-safety education adoption.";
  }

  if (/COURT/i.test(name)) {
    return "Relevant court-adjacent target for justice-system awareness, education routing, and institutional credibility.";
  }

  if (score >= 72) {
    return "Elevated priority based on hybrid scoring across revenue potential, training fit, actionability, and strategic credibility.";
  }

  return "Review target with public-safety relevance that may become stronger after contact verification.";
}

function expectedValue(target) {
  const score = Number(target.phase3_scores?.final_score ?? target.final_score ?? 0);

  if (score >= 85) return "Very high-value first-contact opportunity.";
  if (score >= 72) return "Strong first-wave opportunity.";
  if (score >= 60) return "Viable second-wave opportunity.";
  return "Manual-review opportunity pending better contact or fit confirmation.";
}

function recommendedNextStep(target) {
  if (target.contact_url || target.website) {
    return "Verify public contact route, identify the correct training or administrative contact, then prepare first outreach.";
  }

  return "Manual contact research required before outreach.";
}

function riskNotes(target) {
  const notes = [];

  if (!target.website && !target.contact_url) {
    notes.push("No public website/contact URL present in current dataset.");
  }

  if (target.priority_band === "PRIORITY_REVIEW") {
    notes.push("Lower scoring band; validate fit before outreach.");
  }

  if (/COURT/i.test(clean(target.agency_name))) {
    notes.push("Court targets may require softer education-oriented framing rather than direct enforcement training framing.");
  }

  if (!notes.length) {
    notes.push("No major blocking issue identified; still requires human contact verification before outreach.");
  }

  return notes;
}

function confidence(target) {
  const score = Number(target.phase3_scores?.final_score ?? target.final_score ?? 0);
  const hasContact = !!(target.website || target.contact_url);

  let value = 0.55;

  if (score >= 72) value += 0.18;
  else if (score >= 60) value += 0.1;

  if (hasContact) value += 0.12;

  if (/POLICE|SHERIFF|HIDTA|TASK FORCE|PUBLIC SAFETY|DPS/i.test(clean(target.agency_name))) {
    value += 0.1;
  }

  return Number(Math.min(value, 0.92).toFixed(2));
}

function buildDossier(target) {
  return {
    dossier_type: "black_dragon_agency_target",
    agency_class: agencyClass(target),
    priority_summary: priorityReason(target),
    recommended_contact: recommendedContact(target),
    outreach_angle: target.outreach_angle || "Public-safety education and agency training alignment.",
    expected_value: expectedValue(target),
    recommended_next_step: recommendedNextStep(target),
    confidence: confidence(target),
    risk_notes: riskNotes(target),
    review_status: "client_dossier_review_required",
    live_outreach_allowed: false
  };
}

function main() {
  console.log("[BD DOSSIER ENRICH] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD DOSSIER ENRICH] Missing input: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  const enriched = targets.map((target) => ({
    ...target,
    black_dragon_dossier: buildDossier(target)
  }));

  const output = {
    source: "black_dragon_phase3_dossier_enrichment",
    generated_at: new Date().toISOString(),
    note: "Dossier enrichment is additive only. Full lead count is preserved.",
    input_count: targets.length,
    output_count: enriched.length,
    targets: enriched
  };

  writeJson(OUTPUT, output);

  console.log("[BD DOSSIER ENRICH] Input:", targets.length);
  console.log("[BD DOSSIER ENRICH] Output:", enriched.length);
  console.log("[BD DOSSIER ENRICH] File:", OUTPUT);
}

main();
