/*
  UMBRA NEXUS — Layer 04
  Claim Relevance Scoring
  Isolated. Deterministic. No Black Dragon imports.
*/

const TERM_GROUPS = Object.freeze({
  civic: ["city", "county", "municipal", "council", "planning", "zoning", "permit", "public"],
  economic: ["business", "development", "investment", "employer", "workforce", "commerce", "economic"],
  infrastructure: ["infrastructure", "utilities", "transportation", "road", "rail", "port", "airport", "energy"],
  entity: ["company", "organization", "agency", "partner", "vendor", "operator", "tenant"],
  location: ["district", "site", "parcel", "address", "corridor", "zone", "campus"]
});

export function processLayer04(input) {
  const record = input?.normalized_record || {};
  const claim = normalize(record.claim);
  const title = normalize(record.source_title);
  const combined = `${claim} ${title}`;

  const reasons = [];
  let score = 0;

  for (const [group, terms] of Object.entries(TERM_GROUPS)) {
    const hits = terms.filter(term => combined.includes(term));
    if (hits.length > 0) {
      const add = Math.min(20, hits.length * 6);
      score += add;
      reasons.push(`${group}_terms:${hits.join(",")}`);
    }
  }

  const authorityScore = Number(input?.authority_score || 0);
  if (authorityScore >= 85) {
    score += 15;
    reasons.push("primary_authority_bonus");
  } else if (authorityScore >= 70) {
    score += 10;
    reasons.push("strong_authority_bonus");
  } else if (authorityScore >= 45) {
    score += 5;
    reasons.push("moderate_authority_bonus");
  }

  const classification = normalize(input?.classification);
  if (classification === "city_local_primary") {
    score += 10;
    reasons.push("city_local_primary_bonus");
  } else if (classification === "city_local_secondary") {
    score += 5;
    reasons.push("city_local_secondary_bonus");
  }

  score = clamp(score, 0, 100);

  return Object.freeze({
    layer_id: "layer_04",
    record_id: input?.record_id || null,
    relevance_score: score,
    relevance_class: classifyRelevance(score),
    relevance_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function classifyRelevance(score) {
  if (score >= 85) return "critical_operational_relevance";
  if (score >= 70) return "high_operational_relevance";
  if (score >= 45) return "moderate_operational_relevance";
  if (score >= 20) return "low_operational_relevance";
  return "not_operationally_relevant";
}
