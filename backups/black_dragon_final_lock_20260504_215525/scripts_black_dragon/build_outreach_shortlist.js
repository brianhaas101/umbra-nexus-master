const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const READY_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/ready_targets.json"
);

const OUTPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/outreach_shortlist.json"
);

function readJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function clean(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function buildEmailLine(target) {
  const agency = clean(target.agency_name);
  const state = clean(target.state);
  const role =
    clean(target.contact?.title) ||
    clean(target.contact?.department) ||
    "Training / Command Staff";

  return `Black Dragon OMG certification training for ${agency}${state ? ` (${state})` : ""}`;
}

function buildOutreachSummary(target) {
  return {
    target_id: target.target_id || null,
    agency_name: target.agency_name || null,
    city: target.city || null,
    state: target.state || null,
    priority_band: target.priority_band || null,
    score: target.score || null,

    contact: {
      name: target.contact?.name || "",
      title: target.contact?.title || "",
      department: target.contact?.department || "",
      email: target.contact?.email || "",
      phone: target.contact?.phone || "",
      extension: target.contact?.extension || "",
      source_url: target.contact?.source_url || ""
    },

    recommended_contact_roles: target.recommended_contact_roles || [],
    why_this_target: target.why_this_target || [],
    outreach_angle: target.outreach_angle || "",

    outreach_status: "READY_TO_CONTACT",
    suggested_subject_line: buildEmailLine(target),

    suggested_first_message_notes: [
      "Lead with officer safety and practical field readiness.",
      "Reference motorcycle-club encounter training without sounding alarmist.",
      "Ask for the correct training or command contact if this is not the right person.",
      "Keep message short; goal is reply or referral, not full sale in first email."
    ],

    next_action: "SEND_FIRST_TOUCH_OR_CALL",
    reviewed: false,
    contacted: false,
    contacted_at: null,
    reply_received: false,
    notes: ""
  };
}

function main() {
  const readyTargets = readJson(READY_PATH, []);

  const shortlist = readyTargets
    .filter(target => target.contact_ready === true || target.status === "READY_FOR_OUTREACH")
    .map(buildOutreachSummary)
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

  const output = {
    version: "black_dragon_outreach_shortlist_v1",
    generated_at: new Date().toISOString(),
    client_key: "black_dragon",
    source: "ready_targets.json",
    total_ready_targets: shortlist.length,
    usage_note: "This file contains only targets that passed strict contact readiness checks.",
    targets: shortlist
  };

  writeJson(OUTPUT_PATH, output);

  console.log("[OUTREACH SHORTLIST] COMPLETE");
  console.log("[OUTREACH SHORTLIST] Targets:", shortlist.length);
  console.log("[OUTREACH SHORTLIST] Output:", OUTPUT_PATH);
}

main();