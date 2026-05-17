// scripts/clients/black_dragon/contact_candidate_collector.js

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const INPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/scored_targets.json"
);

const OUTPUT_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_candidates.json"
);

const LOG_PATH = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_candidate_collector_log.json"
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

const ROLE_KEYWORDS = [
  "training",
  "academy",
  "commander",
  "lieutenant",
  "captain",
  "sergeant",
  "chief",
  "sheriff",
  "professional",
  "standards",
  "operations",
  "administration",
  "procurement",
  "recruiting",
  "recruitment"
];

const EXTRA_PATHS = [
  "",
  "/contact",
  "/contact-us",
  "/contacts",
  "/staff",
  "/directory",
  "/police",
  "/police-department",
  "/public-safety",
  "/training",
  "/academy",
  "/recruiting",
  "/recruitment",
  "/administration"
];

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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

function getHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function buildCandidateUrls(target) {
  const baseUrls = Array.from(new Set([
    cleanUrl(target.contact_url),
    cleanUrl(target.website)
  ].filter(Boolean)));

  const urls = new Set();

  for (const url of baseUrls) {
    urls.add(url);

    const host = getHost(url);
    if (!host) continue;

    for (const extraPath of EXTRA_PATHS) {
      urls.add(`https://${host}${extraPath}`);
    }
  }

  return Array.from(urls);
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "UmbraNexusContactCandidateCollector/1.0",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      return {
        ok: false,
        url,
        status: `HTTP_${response.status}`,
        text: ""
      };
    }

    return {
      ok: true,
      url,
      status: "OK",
      text: await response.text()
    };
  } catch (error) {
    return {
      ok: false,
      url,
      status: "FETCH_FAILED",
      error: error.message,
      text: ""
    };
  }
}

function inferRoleScore(value) {
  const lower = String(value || "").toLowerCase();
  let score = 0;

  for (const keyword of ROLE_KEYWORDS) {
    if (lower.includes(keyword)) score += 12;
  }

  if (lower.includes("training")) score += 30;
  if (lower.includes("academy")) score += 25;
  if (lower.includes("commander")) score += 20;
  if (lower.includes("chief")) score += 15;
  if (lower.includes("captain")) score += 15;
  if (lower.includes("lieutenant")) score += 15;
  if (lower.includes("procurement")) score += 15;

  return score;
}

function scoreEmail(email, target, sourceUrl) {
  let score = 0;
  const lower = email.toLowerCase();

  if (!isGenericEmail(lower)) score += 45;
  else score -= 40;

  score += inferRoleScore(lower);

  const sourceHost = getHost(sourceUrl);
  if (sourceHost && lower.endsWith(`@${sourceHost}`)) score += 25;

  const targetHost = getHost(cleanUrl(target.website || target.contact_url));
  if (targetHost && lower.endsWith(`@${targetHost}`)) score += 25;

  if (lower.includes("police")) score += 8;
  if (lower.includes("training")) score += 25;
  if (lower.includes("academy")) score += 20;

  return score;
}

function scorePhone(phone) {
  let score = 20;

  if (/(x|ext\.?|extension)\s*\d+/i.test(phone)) score += 30;

  return score;
}

function classifyCandidate(email, phone, score) {
  if (email && !isGenericEmail(email) && phone && score >= 70) {
    return "STRONG_REVIEW";
  }

  if (email && !isGenericEmail(email)) {
    return "EMAIL_REVIEW";
  }

  if (phone) {
    return "PHONE_REVIEW";
  }

  return "LOW_VALUE";
}

function nearbyTextForEmail(html, email) {
  const clean = normalizeText(html);
  const idx = clean.toLowerCase().indexOf(email.toLowerCase());

  if (idx === -1) return "";

  const start = Math.max(0, idx - 240);
  const end = Math.min(clean.length, idx + 240);

  return clean.slice(start, end);
}

function buildEmailCandidates({ emails, phones, html, sourceUrl, target }) {
  return emails.map(email => {
    const context = nearbyTextForEmail(html, email);
    const bestPhone = phones[0] || null;
    const score = scoreEmail(email, target, sourceUrl) + inferRoleScore(context) + (bestPhone ? 15 : 0);

    return {
      candidate_type: "email_candidate",
      email,
      email_is_generic: isGenericEmail(email),
      phone: bestPhone,
      phone_score: bestPhone ? scorePhone(bestPhone) : 0,
      candidate_score: score,
      candidate_class: classifyCandidate(email, bestPhone, score),
      source_url: sourceUrl,
      context
    };
  });
}

function buildPhoneOnlyCandidates({ phones, sourceUrl }) {
  return phones.map(phone => {
    const score = scorePhone(phone);

    return {
      candidate_type: "phone_candidate",
      email: null,
      email_is_generic: null,
      phone,
      phone_score: score,
      candidate_score: score,
      candidate_class: "PHONE_REVIEW",
      source_url: sourceUrl,
      context: ""
    };
  });
}

async function collectForTarget(target, index) {
  const urls = buildCandidateUrls(target);
  const candidates = [];
  const checked = [];

  for (const url of urls) {
    const result = await fetchPage(url);

    checked.push({
      url,
      ok: result.ok,
      status: result.status,
      error: result.error || null
    });

    if (result.ok && result.text) {
      const emails = extractEmails(result.text);
      const phones = extractPhones(result.text);

      candidates.push(
        ...buildEmailCandidates({
          emails,
          phones,
          html: result.text,
          sourceUrl: url,
          target
        })
      );

      if (!emails.length && phones.length) {
        candidates.push(
          ...buildPhoneOnlyCandidates({
            phones,
            sourceUrl: url
          })
        );
      }
    }

    await sleep(350);
  }

  const deduped = new Map();

  for (const candidate of candidates) {
    const key = `${candidate.email || "no-email"}|${candidate.phone || "no-phone"}|${candidate.source_url}`;

    const existing = deduped.get(key);
    if (!existing || candidate.candidate_score > existing.candidate_score) {
      deduped.set(key, candidate);
    }
  }

  const ranked = Array.from(deduped.values())
    .sort((a, b) => b.candidate_score - a.candidate_score);

  return {
    target_id: target.target_id || `BD-TARGET-${String(index + 1).padStart(3, "0")}`,
    master_id: target.master_id || null,
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
    candidate_summary: {
      urls_checked: checked.length,
      candidates_found: ranked.length,
      strong_review_candidates: ranked.filter(c => c.candidate_class === "STRONG_REVIEW").length,
      non_generic_emails: ranked.filter(c => c.email && !c.email_is_generic).length,
      phone_candidates: ranked.filter(c => c.phone).length
    },
    recommended_next_action:
      ranked.some(c => c.candidate_class === "STRONG_REVIEW")
        ? "MANUAL_VERIFY_TOP_CANDIDATE"
        : ranked.length
          ? "REVIEW_CANDIDATES"
          : "MANUAL_RESEARCH_REQUIRED",
    checked_urls: checked,
    candidates: ranked.slice(0, 20)
  };
}

async function main() {
  const input = readJson(INPUT_PATH, []);

  const targets = Array.isArray(input)
    ? input
    : input.targets || input.data || input.entities || [];

  const outputs = [];

  console.log("[CANDIDATES] Starting candidate collection...");
  console.log("[CANDIDATES] Input targets:", targets.length);

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];

    console.log(`[CANDIDATES] ${i + 1}/${targets.length}: ${target.agency_name || target.target_id || "Unknown target"}`);

    const result = await collectForTarget(target, i);
    outputs.push(result);
  }

  const summary = {
    version: "black_dragon_contact_candidates_v1",
    generated_at: new Date().toISOString(),
    input_targets: targets.length,
    agencies_with_candidates: outputs.filter(o => o.candidate_summary.candidates_found > 0).length,
    agencies_with_strong_review: outputs.filter(o => o.candidate_summary.strong_review_candidates > 0).length,
    total_candidates: outputs.reduce((sum, o) => sum + o.candidate_summary.candidates_found, 0),
    total_non_generic_emails: outputs.reduce((sum, o) => sum + o.candidate_summary.non_generic_emails, 0),
    total_phone_candidates: outputs.reduce((sum, o) => sum + o.candidate_summary.phone_candidates, 0),
    strict_note: "Candidates are not READY until manually verified or promoted by strict override rules."
  };

  writeJson(OUTPUT_PATH, {
    ...summary,
    targets: outputs
  });

  writeJson(LOG_PATH, summary);

  console.log("[CANDIDATES] COMPLETE");
  console.log("[CANDIDATES] Agencies with candidates:", summary.agencies_with_candidates);
  console.log("[CANDIDATES] Agencies with strong review:", summary.agencies_with_strong_review);
  console.log("[CANDIDATES] Total candidates:", summary.total_candidates);
}

main().catch(error => {
  console.error("[CANDIDATES] FAILED", error);
  process.exit(1);
});