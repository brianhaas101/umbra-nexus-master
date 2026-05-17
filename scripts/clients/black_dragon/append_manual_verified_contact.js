const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const INPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_verified_contact_patch.json"
);

const OUTPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_verified_contacts.json"
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

  return true;
}

function assertRequired(contact) {
  const errors = [];

  if (!clean(contact.master_id)) errors.push("missing master_id");
  if (!clean(contact.agency_name)) errors.push("missing agency_name");
  if (!clean(contact.city)) errors.push("missing city");
  if (!clean(contact.state)) errors.push("missing state");
  if (!clean(contact.verified_contact?.department)) errors.push("missing department");
  if (!clean(contact.verified_contact?.phone)) errors.push("missing phone");
  if (!isValidPhone(contact.verified_contact?.phone)) errors.push("invalid phone");
  if (!clean(contact.verified_contact?.source_url)) errors.push("missing source_url");

  return errors;
}

function main() {
  const patch = readJson(INPUT_PATH, null);
  if (!patch) {
    console.error("Missing patch file");
    process.exit(1);
  }

  const store = readJson(OUTPUT_PATH, {
    version: "black_dragon_manual_verified_contacts_v1",
    updated_at: new Date().toISOString(),
    contacts: []
  });

  const errors = assertRequired(patch);
  if (errors.length) {
    console.error("BLOCKED:");
    errors.forEach(e => console.error("-", e));
    process.exit(1);
  }

  const index = store.contacts.findIndex(c =>
    c.master_id === patch.master_id ||
    (patch.authority_target_id && c.authority_target_id === patch.authority_target_id)
  );

  if (index >= 0) {
    store.contacts[index] = patch;
    console.log("UPDATED:", patch.agency_name);
  } else {
    store.contacts.push(patch);
    console.log("ADDED:", patch.agency_name);
  }

  store.updated_at = new Date().toISOString();

  writeJson(OUTPUT_PATH, store);

  console.log("TOTAL:", store.contacts.length);
}

main();
