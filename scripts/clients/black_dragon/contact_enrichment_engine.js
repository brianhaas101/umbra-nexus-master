// scripts/clients/black_dragon/contact_enrichment_engine.js

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const INPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/enrichment_queue.json"
);

const READY_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/ready_targets.json"
);

const STILL_ENRICH_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/enrichment_queue.json"
);

const ENRICHED_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_enriched_targets.json"
);

const LOG_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_enrichment_log.json"
);

const OVERRIDE_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_contact_overrides.json"
);

const GENERIC_EMAIL_PATTERNS = [
  /^info@/i,
  /^admin@/i,
  /^contact@/i,
  /^support@/i,
  /^webmaster@/i,
  /^noreply@/i,
  /^no-reply@/i,
  /^records@/i,
  /^publicrecords@/i,
  /^media@/i
];

const ROLE_HINTS = [
  "training",
  "academy",
  "commander",
  "lieutenant",
  "captain",
  "sergeant",
  "chief",
  "sheriff",
  "professional standards",
  "operations",
  "administration",
  "procurement"
];

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadOverrides() {
  const data = readJson(OVERRIDE_PATH, { contacts: [] });
  const map = new Map();

  (data.contacts || []).forEach(contact => {
    if (contact.master_id) map.set(`master:${contact.master_id}`, contact);
    if (contact.entity_id) map.set(`entity:${contact.entity_id}`, contact);
    if (contact.authority_target_id) map.set(`authority:${contact.authority_target_id}`, contact);

    if (contact.agency_name) {
      const state = contact.state || "";
      map.set(`agency:${contact.agency_name.toLowerCase()}|${state}`, contact);
    }
  });

  return map;
}

function findOverrideForTarget(overrides, target) {
  if (!target) return null;

  const directMatches = [
    target.master_id ? `master:${target.master_id}` : null,
    target.entity_id ? `entity:${target.entity_id}` : null,
    target.authority_target_id ? `authority:${target.authority_target_id}` : null,
    target.agency_name ? `agency:${target.agency_name.toLowerCase()}|${target.state || ""}` : null
  ].filter(Boolean);

  for (const key of directMatches) {
    if (overrides.has(key)) return overrides.get(key);
  }

  for (const override of overrides.values()) {
    if (
      override.agency_name &&
      target.agency_name &&
      override.agency_name.toLowerCase() === target.agency_name.toLowerCase() &&
      (!override.state || !target.state || override.state === target.state)
    ) {
      return override;
    }
  }

  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanUrl(url) {
  if (!url || typeof url !== "string") return null;

  const cleaned = url.trim().replace(/\s+/g, "");

  if (!/^https?:\/\//i.test(cleaned)) return null;

  return cleaned;
}

function normalizeText(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#64;/g, "@")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEmails(text) {
  const matches = normalizeText(text).match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
  );

  return Array.from(new Set(matches || []))
    .map(email => email.trim().toLowerCase());
}

function extractPhones(text) {
  const matches = normalizeText(text).match(
    /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}(?:\s*(?:x|ext\.?|extension)\s*\d+)?/gi
  );

  return Array.from(new Set(matches || []))
    .map(phone => phone.trim());
}

function isGenericEmail(email) {
  if (!email) return true;
  return GENERIC_EMAIL_PATTERNS.some(pattern => pattern.test(email));
}

function normalizePhoneNumber(phone) {
  const raw = String(phone || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const d = digits.slice(1);
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  return null;
}

function scoreEmail(email, target) {
  let score = 0;
  const lower = email.toLowerCase();

  if (!isGenericEmail(lower)) score += 40;

  for (const hint of ROLE_HINTS) {
    if (lower.includes(hint.replace(/\s+/g, ""))) score += 15;
  }

  const website = cleanUrl(target.website || target.contact_url);
  if (website) {
    try {
      const host = new URL(website).hostname.replace(/^www\./, "");
      if (lower.endsWith(`@${host}`) || lower.includes(host.split(".")[0])) {
        score += 25;
      }
    } catch {}
  }

  return score;
}

function chooseBestEmail(emails, target) {
  const usable = emails.filter(email => !isGenericEmail(email));

  if (!usable.length) return null;

  return usable
    .map(email => ({
      email,
      score: scoreEmail(email, target)
    }))
    .sort((a, b) => b.score - a.score)[0].email;
}

function chooseBestPhone(phones) {
  if (!phones.length) return null;

  const withExtension = phones.find(phone =>
    /(x|ext\.?|extension)\s*\d+/i.test(phone)
  );

  return withExtension || phones[0];
}

function hasCompleteAgency(target) {
  return Boolean(
    target.agency_name &&
    target.city &&
    target.state &&
    target.country &&
    (target.website || target.contact_url)
  );
}

function buildContactRoles(target) {
  const type = String(target.agency_type || target.authority_type || "").toLowerCase();

  if (type.includes("court")) {
    return [
      "Court Administrator",
      "Training Coordinator",
      "Presiding Judge Office",
      "Clerk Administration"
    ];
  }

  if (type.includes("prosecutor")) {
    return [
      "Chief Prosecutor",
      "Training Coordinator",
      "Office Administrator",
      "Public Safety Liaison"
    ];
  }

  return [
    "Training Division Commander",
    "Training Coordinator",
    "Command Staff",
    "Lieutenant / Captain",
    "Procurement or Administration"
  ];
}

function buildReason(target) {
  const score = target.phase3_scores?.final_score ?? target.score ?? null;
  const priority = target.priority_band || target.priority || "PRIORITY_REVIEW";
  const tier = target.validated_tier || "UNVERIFIED_TIER";
  const type = target.agency_type || target.authority_type || "public safety authority";

  return [
    `${target.agency_name} is classified as ${priority} with ${score ?? "unavailable"} final score.`,
    `Agency type is ${type}, with ${tier} validation status.`,
    "Recommended for Black Dragon review because it matches the public-safety training buyer profile.",
    "Current contact record has been evaluated under strict outreach-readiness rules."
  ];
}

function buildOutreachAngle(target) {
  if (target.outreach_angle) {
    return target.outreach_angle;
  }

  const type = String(target.agency_type || target.authority_type || "").toLowerCase();

  if (type.includes("court") || type.includes("prosecutor")) {
    return "Position the training as justice-system awareness for motorcycle-club culture, officer testimony context, and public-safety coordination.";
  }

  return "Position the training as officer-safety preparation for real-world motorcycle club encounters, escalation patterns, and field decision-making.";
}

function normalizeOverrideContact(override, target, index) {
  const vc = override?.verified_contact || {};

  const email = String(vc.email || "").trim().toLowerCase();
  const phone = normalizePhoneNumber(vc.phone);
  const extension = String(vc.extension || "").trim();

  const emailValid =
    Boolean(email) &&
    !isGenericEmail(email) &&
    override?.validation?.email_valid !== false;

  const phoneValid =
    Boolean(phone) &&
    override?.validation?.phone_valid !== false;

  const roleValid =
    override?.validation?.role_valid === true ||
    override?.validation?.meets_strict_contact_rules === true ||
    override?.status === "READY";

  const mergedAgencyRecord = {
  ...target,
  agency_name: target.agency_name || override.agency_name,
  city: target.city || override.city,
  state: target.state || override.state,
  country: target.country || override.country || "US",
  website: target.website || override.website || vc.source_url,
  contact_url: target.contact_url || override.contact_url || vc.source_url
};

const completeAgency = hasCompleteAgency(mergedAgencyRecord);

  const missing = [];

  if (!completeAgency) missing.push("INCOMPLETE_AGENCY_RECORD");
  if (!emailValid) missing.push("MISSING_NON_GENERIC_WORK_EMAIL");
  if (!phoneValid) missing.push("MISSING_PHONE_NUMBER");
  if (!roleValid) missing.push("ROLE_NOT_VALIDATED");

  const ready = missing.length === 0;

  return {
    target_id: target.target_id || `BD-TARGET-${String(index + 1).padStart(3, "0")}`,
    master_id: target.master_id || override.master_id || null,
    entity_id: target.entity_id || override.entity_id || null,
    authority_target_id: target.authority_target_id || override.authority_target_id || null,
    agency_name: target.agency_name || override.agency_name || null,
    city: mergedAgencyRecord.city || null,
    state: mergedAgencyRecord.state || null,
    country: mergedAgencyRecord.country || "US",
    website: mergedAgencyRecord.website || null,
    contact_url: mergedAgencyRecord.contact_url || null,
    contact: {
      name: vc.name || "",
      title: vc.title || "",
      department: vc.department || "",
      email,
      phone,
      extension: extension || null,
      source_url: vc.source_url || "",
      source: "manual_override",
      verified_at: vc.verified_at || null,
      verified_by: vc.verified_by || "candidate_review"
    },
    contact_ready: ready,
    status: ready ? "READY_FOR_OUTREACH" : "NEEDS_ENRICHMENT",
    missing_requirements: missing,
    override_used: true,
    recommended_contact_roles: buildContactRoles(target),
    why_this_target: buildReason(target),
    outreach_angle: buildOutreachAngle(target),
    source_trace: {
      source_id: target.source_id || null,
      source_name: target.source_name || null,
      enrichment_checked_at: new Date().toISOString(),
      override_source: "manual_contact_overrides.json"
    },
    original_target: target
  };
}

async function fetchPage(url) {
  const clean = cleanUrl(url);
  if (!clean) {
    return {
      ok: false,
      url,
      status: "INVALID_URL",
      text: ""
    };
  }

  try {
    const response = await fetch(clean, {
      headers: {
        "User-Agent": "UmbraNexusContactEnrichment/1.0",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        url: clean,
        status: `HTTP_${response.status}`,
        text: ""
      };
    }

    const text = await response.text();

    return {
      ok: true,
      url: clean,
      status: "OK",
      text
    };
  } catch (error) {
    return {
      ok: false,
      url: clean,
      status: "FETCH_FAILED",
      error: error.message,
      text: ""
    };
  }
}

async function enrichTarget(target, index) {
  const urls = Array.from(new Set([
    cleanUrl(target.contact_url),
    cleanUrl(target.website)
  ].filter(Boolean)));

  const collectedEmails = [];
  const collectedPhones = [];
  const fetchReports = [];

  for (const url of urls) {
    const result = await fetchPage(url);
    fetchReports.push({
      url: result.url,
      ok: result.ok,
      status: result.status,
      error: result.error || null
    });

    if (result.text) {
      collectedEmails.push(...extractEmails(result.text));
      collectedPhones.push(...extractPhones(result.text));
    }

    await sleep(450);
  }

  const emails = Array.from(new Set(collectedEmails));
  const phones = Array.from(new Set(collectedPhones));

  const bestEmail = chooseBestEmail(emails, target);
  const bestPhone = chooseBestPhone(phones);

  const completeAgency = hasCompleteAgency(target);

  const contact = {
    email: bestEmail,
    phone: bestPhone,
    all_emails_found: emails,
    all_phones_found: phones,
    generic_emails_found: emails.filter(isGenericEmail),
    source_urls_checked: urls
  };

  const missing = [];

  if (!completeAgency) missing.push("INCOMPLETE_AGENCY_RECORD");
  if (!bestEmail) missing.push("MISSING_NON_GENERIC_WORK_EMAIL");
  if (!bestPhone) missing.push("MISSING_PHONE_NUMBER");

  const ready = missing.length === 0;

  return {
    target_id: target.target_id || `BD-TARGET-${String(index + 1).padStart(3, "0")}`,
    master_id: target.master_id || null,
    entity_id: target.entity_id || null,
    authority_target_id: target.authority_target_id || null,
    agency_name: target.agency_name || null,
    city: target.city || null,
    state: target.state || null,
    country: target.country || "US",
    agency_type: target.agency_type || target.authority_type || null,
    priority_band: target.priority_band || target.priority || "PRIORITY_REVIEW",
    score: target.phase3_scores?.final_score ?? target.score ?? null,
    website: target.website || null,
    contact_url: target.contact_url || null,
    contact,
    contact_ready: ready,
    status: ready ? "READY_FOR_OUTREACH" : "NEEDS_ENRICHMENT",
    missing_requirements: missing,
    override_used: false,
    recommended_contact_roles: buildContactRoles(target),
    why_this_target: buildReason(target),
    outreach_angle: buildOutreachAngle(target),
    source_trace: {
      source_id: target.source_id || null,
      source_name: target.source_name || null,
      enrichment_checked_at: new Date().toISOString(),
      fetch_reports: fetchReports
    },
    original_target: target
  };
}

async function main() {
  const input = readJson(INPUT_PATH, []);

  const targets = Array.isArray(input)
    ? input
    : input.targets || input.data || input.entities || [];

  const overrides = loadOverrides();

  const ready = [];
  const stillNeedsEnrichment = [];
  const enriched = [];

  console.log("[ENRICH] Starting contact enrichment...");
console.log("[DEBUG] Overrides loaded:", overrides.size);
  console.log("[ENRICH] Input targets:", targets.length);
  console.log("[ENRICH] Manual overrides loaded:", overrides.size);

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    console.log(`[ENRICH] ${i + 1}/${targets.length}: ${target.agency_name || target.target_id || "Unknown target"}`);

    const override = findOverrideForTarget(overrides, target);
      const isReady =
        override &&
        override.validation &&
        override.validation.email_valid === true &&
        override.validation.phone_valid === true &&
        override.validation.role_valid === true &&
        override.validation.meets_strict_contact_rules === true;

    let enrichedTarget;

    if (override) {
      enrichedTarget = normalizeOverrideContact(override, target, i);
    } else {
      enrichedTarget = await enrichTarget(target, i);
    }

    enriched.push(enrichedTarget);

    if (enrichedTarget.contact_ready) {
      ready.push(enrichedTarget);
    } else {
      stillNeedsEnrichment.push(enrichedTarget);
    }
  }

  const summary = {
    generated_at: new Date().toISOString(),
    input_targets: targets.length,
    manual_overrides_loaded: overrides.size,
    ready_targets: ready.length,
    still_needs_enrichment: stillNeedsEnrichment.length,
    strict_rules: {
      no_generic_emails: true,
      no_missing_phone_numbers: true,
      no_incomplete_agencies: true,
      only_contact_ready_passes: true
    }
  };

  writeJson(READY_PATH, ready);
  writeJson(STILL_ENRICH_PATH, stillNeedsEnrichment);
  writeJson(ENRICHED_PATH, {
    version: "black_dragon_contact_enriched_targets_v1",
    ...summary,
    targets: enriched
  });
  writeJson(LOG_PATH, summary);

  console.log("[ENRICH] COMPLETE");
  console.log("[ENRICH] READY:", ready.length);
  console.log("[ENRICH] STILL NEEDS ENRICHMENT:", stillNeedsEnrichment.length);
}

main().catch(error => {
  console.error("[ENRICH] FAILED", error);
  process.exit(1);
});
