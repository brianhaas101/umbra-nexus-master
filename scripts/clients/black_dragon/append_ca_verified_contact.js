const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const PATCH_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_candidates/ca_verified_contact_patch.json"
);

const QUEUE_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_candidates/ca_manual_verification_queue.json"
);

const OUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_candidates/ca_verified_contacts.json"
);

function readJson(filePath, fallback) {
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

function assertPatch(patch) {
  const errors = [];

  if (!clean(patch.queue_id)) errors.push("missing queue_id");
  if (!clean(patch.agency_name)) errors.push("missing agency_name");
  if (clean(patch.state) !== "CA") errors.push("state must be CA");
  if (!clean(patch.city)) errors.push("missing city");
  if (!clean(patch.verified_contact?.department)) errors.push("missing verified_contact.department");
  if (!clean(patch.verified_contact?.phone)) errors.push("missing verified_contact.phone");
  if (!isValidPhone(patch.verified_contact?.phone)) errors.push("invalid verified_contact.phone");
  if (!clean(patch.verified_contact?.source_url)) errors.push("missing verified_contact.source_url");
  if (!clean(patch.contact_path?.primary_route)) errors.push("missing contact_path.primary_route");

  if (patch.validation?.phone_valid !== true) errors.push("validation.phone_valid must be true");
  if (patch.validation?.role_valid !== true) errors.push("validation.role_valid must be true");
  if (patch.validation?.source_verified !== true) errors.push("validation.source_verified must be true");
  if (patch.validation?.meets_strict_contact_rules !== true) {
    errors.push("validation.meets_strict_contact_rules must be true");
  }

  return errors;
}

function main() {
  const patch = readJson(PATCH_PATH, null);
  if (!patch) {
    console.error("[CA APPEND] Missing patch file:", PATCH_PATH);
    process.exit(1);
  }

  const queue = readJson(QUEUE_PATH, { targets: [] });
  const queueMatch = (queue.targets || []).find(t => t.queue_id === patch.queue_id);

  if (!queueMatch) {
    console.error("[CA APPEND] BLOCKED: queue_id not found in CA manual verification queue:", patch.queue_id);
    process.exit(1);
  }

  if (queueMatch.agency_name !== patch.agency_name) {
    console.error("[CA APPEND] BLOCKED: agency_name does not match queue record.");
    console.error("Queue:", queueMatch.agency_name);
    console.error("Patch:", patch.agency_name);
    process.exit(1);
  }

  const errors = assertPatch(patch);
  if (errors.length) {
    console.error("[CA APPEND] BLOCKED");
    for (const error of errors) console.error("-", error);
    process.exit(1);
  }

  const store = readJson(OUT_PATH, {
    version: "black_dragon_ca_verified_contacts_v1",
    generated_at: new Date().toISOString(),
    state: "CA",
    contacts: []
  });

  const existingIndex = store.contacts.findIndex(c =>
    c.queue_id === patch.queue_id ||
    (
      c.agency_name === patch.agency_name &&
      c.state === patch.state
    )
  );

  if (existingIndex >= 0) {
    store.contacts[existingIndex] = patch;
    console.log("[CA APPEND] UPDATED:", patch.agency_name);
  } else {
    store.contacts.push(patch);
    console.log("[CA APPEND] ADDED:", patch.agency_name);
  }

  store.updated_at = new Date().toISOString();

  writeJson(OUT_PATH, store);

  console.log("[CA APPEND] Total CA verified:", store.contacts.length);
}

main();
