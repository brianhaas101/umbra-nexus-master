const fs = require("fs");
const path = require("path");

const SOURCES = [
  {
    state: "AZ",
    path: "public/data/clients/black_dragon/outreach_shortlist.json",
    type: "outreach_shortlist"
  },
  {
    state: "CA",
    path: "public/data/clients/black_dragon/state_candidates/ca_verified_contacts.json",
    type: "state_verified_contacts"
  },
  {
    state: "TX",
    path: "public/data/clients/black_dragon/state_candidates/tx_verified_contacts.json",
    type: "state_verified_contacts"
  }
];

const OUT_PATH = "public/data/clients/black_dragon/national_verified_outreach_shortlist.json";

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeFromAz(item) {
  return {
    state: item.state || "AZ",
    agency_name: item.agency_name,
    city: item.city || "",
    contact: item.contact,
    contact_path: item.contact_path || {},
    outreach_status: item.outreach_status || "READY_TO_CALL",
    source_scope: "AZ_VERIFIED_BATCH"
  };
}

function normalizeFromStateVerified(item) {
  return {
    state: item.state,
    agency_name: item.agency_name,
    city: item.city || "",
    contact: {
      name: item.verified_contact?.name || "",
      title: item.verified_contact?.title || "",
      department: item.verified_contact?.department || "",
      email: item.verified_contact?.email || "",
      phone: item.verified_contact?.phone || "",
      extension: item.verified_contact?.extension || "",
      source_url: item.verified_contact?.source_url || "",
      secondary_source_url: item.verified_contact?.secondary_source_url || ""
    },
    contact_path: item.contact_path || {},
    outreach_status: item.status || "READY_TO_CALL",
    source_scope: item.state + "_VERIFIED_BATCH"
  };
}

function main() {
  const targets = [];

  for (const src of SOURCES) {
    const data = readJson(src.path, null);
    if (!data) continue;

    if (src.type === "outreach_shortlist") {
      for (const item of data.targets || []) targets.push(normalizeFromAz(item));
    }

    if (src.type === "state_verified_contacts") {
      for (const item of data.contacts || []) targets.push(normalizeFromStateVerified(item));
    }
  }

  const seen = new Set();
  const deduped = [];

  for (const target of targets) {
    const key = `${target.state}|${target.agency_name}`.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(target);
  }

  const output = {
    version: "black_dragon_national_verified_outreach_shortlist_v1",
    generated_at: new Date().toISOString(),
    rule: "Only manually verified contact paths may enter this national shortlist.",
    total_targets: deduped.length,
    states_included: [...new Set(deduped.map(t => t.state))].sort(),
    targets: deduped
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

  console.log("[NATIONAL SHORTLIST] COMPLETE");
  console.log("[NATIONAL SHORTLIST] Targets:", output.total_targets);
  console.log("[NATIONAL SHORTLIST] States:", output.states_included.join(", "));
}

main();
