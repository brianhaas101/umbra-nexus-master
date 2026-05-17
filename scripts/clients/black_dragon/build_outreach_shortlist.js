const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const READY_PATH = path.join(ROOT, "public/data/clients/black_dragon/ready_targets.json");
const VERIFIED_PATH = path.join(ROOT, "public/data/clients/black_dragon/manual_verified_contacts.json");
const OUTPUT_PATH = path.join(ROOT, "public/data/clients/black_dragon/outreach_shortlist.json");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function clean(v) {
  return v === undefined || v === null ? "" : String(v).trim();
}

function isAllowedAgencyType(name) {
  const n = clean(name).toUpperCase();
  if (!n) return false;
  if (n.includes("COURT") || n.includes("PROSECUTOR") || n.includes("CLERK")) return false;

  return (
    n.includes("POLICE DEPARTMENT") ||
    n.includes("SHERIFF") ||
    n.includes("CAMPUS POLICE") ||
    n.includes("TRIBAL POLICE") ||
    n.includes("PUBLIC SAFETY")
  );
}

function normalizePhone(phone) {
  const digits = clean(phone).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

function isValidPhone(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return false;

  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);

  if (area[0] === "0" || area[0] === "1") return false;
  if (exchange[0] === "0" || exchange[0] === "1") return false;
  if (/^(\d)\1{9}$/.test(digits)) return false;

  const blocked = new Set([
    "0000000000",
    "9999999999",
    "1465647691",
    "2408091386",
    "4885342075"
  ]);

  return !blocked.has(digits);
}

function formatPhone(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return "";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidManualVerified(contact) {
  return (
    isAllowedAgencyType(contact.agency_name) &&
    contact?.validation?.phone_valid === true &&
    contact?.validation?.role_valid === true &&
    contact?.validation?.source_verified === true &&
    contact?.validation?.meets_strict_contact_rules === true &&
    isValidPhone(contact?.verified_contact?.phone)
  );
}

function buildFromManual(contact) {
  return {
    target_id: contact.target_id || null,
    master_id: contact.master_id || null,
    authority_target_id: contact.authority_target_id || null,
    agency_name: contact.agency_name,
    city: contact.city,
    state: contact.state,
    country: contact.country || "US",

    contact: {
      name: contact.verified_contact?.name || "",
      title: contact.verified_contact?.title || "",
      department: contact.verified_contact?.department || "",
      email: contact.verified_contact?.email || "",
      phone: formatPhone(contact.verified_contact?.phone),
      extension: contact.verified_contact?.extension || "",
      source_url: contact.verified_contact?.source_url || "",
      secondary_source_url: contact.verified_contact?.secondary_source_url || ""
    },

    contact_path: contact.contact_path || {},
    recommended_contact_roles: [
      "Training Bureau",
      "Training Division Commander",
      "Training Coordinator",
      "Command Staff"
    ],

    outreach_angle: "Officer safety + real-world motorcycle-club encounter training.",
    outreach_status: contact.status || "READY_TO_CALL",
    next_action: "CALL_AND_CONFIRM_TRAINING_CONTACT",
    reviewed: false,
    contacted: false,
    contacted_at: null,
    reply_received: false,
    notes: contact.notes || "Manual verified contact path."
  };
}

function main() {
  const readyInput = readJson(READY_PATH, []);
  const readyTargets = Array.isArray(readyInput) ? readyInput : readyInput.targets || [];

  const manualInput = readJson(VERIFIED_PATH, { contacts: [] });
  const manualContacts = manualInput.contacts || [];

  const targets = [];
  const rejected = [];

  for (const contact of manualContacts) {
    if (isValidManualVerified(contact)) {
      targets.push(buildFromManual(contact));
    } else {
      rejected.push({
        source: "manual_verified_contacts",
        agency_name: contact.agency_name,
        reason: "FAILED_MANUAL_VERIFIED_GATE"
      });
    }
  }

  for (const target of readyTargets) {
    rejected.push({
      source: "ready_targets",
      agency_name: target.agency_name,
      reason: "SCRAPED_READY_TARGETS_BLOCKED_UNTIL_MANUAL_VERIFIED"
    });
  }

  const output = {
    version: "black_dragon_outreach_shortlist_v3_manual_verified",
    generated_at: new Date().toISOString(),
    client_key: "black_dragon",
    source: "manual_verified_contacts.json",
    total_ready_input: readyTargets.length,
    total_manual_verified_input: manualContacts.length,
    total_ready_targets: targets.length,
    total_rejected: rejected.length,
    usage_note: "Client-facing shortlist generated only from manual verified contact paths. Scraped ready targets are blocked until independently verified.",
    targets,
    rejected
  };

  writeJson(OUTPUT_PATH, output);

  console.log("[OUTREACH SHORTLIST] COMPLETE");
  console.log("[OUTREACH SHORTLIST] Manual verified input:", manualContacts.length);
  console.log("[OUTREACH SHORTLIST] Scraped ready input blocked:", readyTargets.length);
  console.log("[OUTREACH SHORTLIST] Targets:", targets.length);
  console.log("[OUTREACH SHORTLIST] Rejected:", rejected.length);
  console.log("[OUTREACH SHORTLIST] Output:", OUTPUT_PATH);
}

main();
