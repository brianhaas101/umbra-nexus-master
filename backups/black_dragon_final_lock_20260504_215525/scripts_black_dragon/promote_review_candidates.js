const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const REVIEW_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_candidate_review_shortlist.json"
);

const OVERRIDE_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_contact_overrides.json"
);

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ?? STRICT EMAIL RULE
function isValidEmail(email) {
  if (!email) return false;

  const lower = email.toLowerCase();

  // reject generic inboxes
  if (/^(info|admin|contact|support|noreply|no-reply|records|publicrecords|media)@/i.test(lower)) {
    return false;
  }

  return true;
}

// ?? STRICT PHONE RULE
function isValidPhone(phone) {
  if (!phone) return false;

  const digits = phone.replace(/\D/g, '');

  // must be 10 digits
  if (digits.length !== 10) return false;

  // reject fake patterns
  if (/^(\d)\1{9}$/.test(digits)) return false;
  if (digits === "0000000000") return false;
  if (digits === "9999999999") return false;

  // reject date-like numbers
  const year = parseInt(digits.substring(0, 4));
  if (year >= 1900 && year <= 2100) return false;

  return true;
}

// ?? NORMALIZE PHONE
function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return null;
}

function buildOverride(target, candidate) {
  const email = String(candidate.email || "").trim().toLowerCase();
  const rawPhone = candidate.phone || "";

  const phone = normalizePhone(rawPhone);

  const emailValid = isValidEmail(email);
  const phoneValid = isValidPhone(rawPhone);

  // ?? ROLE MUST BE STRONG SIGNAL ONLY
  const roleValid =
    candidate.candidate_class === "STRONG_REVIEW" ||
    candidate.candidate_class === "HIGH_REVIEW";

  // ?? STRICT REAL-WORLD RULE
  const strictValid = emailValid && phoneValid && roleValid;

  return {
    master_id: target.master_id,
    entity_id: null,
    authority_target_id: target.authority_target_id || null,
    agency_name: target.agency_name,
    city: target.city,
    state: target.state,
    country: target.country || "US",

    verified_contact: {
      name: "",
      title: "",
      department: "",
      email: emailValid ? email : "",
      phone: phoneValid ? phone : "",
      extension: "",
      source_url: candidate.source_url || "",
      verified_at: new Date().toISOString(),
      verified_by: "candidate_review"
    },

    validation: {
      email_valid: emailValid,
      phone_valid: phoneValid,
      role_valid: roleValid,
      meets_strict_contact_rules: strictValid
    },

    // ?? NEVER AUTO-READY UNLESS FULLY VALID
    status: strictValid ? "READY" : "INCOMPLETE",

    contact_priority: target.review_status || candidate.candidate_class || "REVIEW",

    recommended_roles: [
      "Training Division Commander",
      "Training Coordinator",
      "Command Staff",
      "Lieutenant / Captain",
      "Procurement or Administration"
    ],

    outreach_notes: "",
    notes: candidate.reviewer_notes || candidate.context || ""
  };
}

function main() {
  const review = readJson(REVIEW_PATH, { targets: [] });

  const overrides = {
    version: "black_dragon_manual_contact_overrides_v1",
    updated_at: new Date().toISOString(),
    strict_rules: {
      no_generic_emails: true,
      no_missing_phone_numbers: true,
      no_incomplete_agencies: true,
      only_contact_ready_passes: true
    },
    contacts: [],
    schema_notes: {
      purpose: "Manual verified contact injection layer for strict outreach readiness",
      promotion_rule: "ONLY real verified contacts pass",
      email_requirements: "No generic inboxes",
      phone_requirements: "Must be real working number",
      role_requirements: "Must match decision-maker roles",
      scaling_strategy: "Start small, validate, then expand"
    }
  };

  const promoted = [];
  const bestByTarget = new Map();

  for (const target of review.targets || []) {
    for (const candidate of target.candidates_to_review || []) {
      if (candidate.promote_to_override !== true) continue;

      const override = buildOverride(target, candidate);

      const key =
        override.authority_target_id ||
        override.master_id ||
        `${override.agency_name}|${override.state}`;

      const existing = bestByTarget.get(key);

      const rank = override.status === "READY" ? 2 : 1;
      const existingRank = existing?.status === "READY" ? 2 : 1;

      if (!existing || rank > existingRank) {
        bestByTarget.set(key, override);
      }
    }
  }

  overrides.contacts = Array.from(bestByTarget.values());

  for (const override of overrides.contacts) {
    promoted.push({
      agency_name: override.agency_name,
      email: override.verified_contact.email,
      phone: override.verified_contact.phone,
      status: override.status
    });
  }

  writeJson(OVERRIDE_PATH, overrides);

  console.log("[PROMOTE] COMPLETE");
  console.log("[PROMOTE] Total:", promoted.length);
  console.log("[PROMOTE] READY:", promoted.filter(p => p.status === "READY").length);
  console.log("[PROMOTE] INCOMPLETE:", promoted.filter(p => p.status !== "READY").length);
}

main();
