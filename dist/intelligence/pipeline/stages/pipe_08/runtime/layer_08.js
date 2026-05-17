/*
  UMBRA NEXUS — Layer 08
  Cross-Source Corroboration
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_FIELDS = Object.freeze([
  "synthetic_source",
  "inferred_corroboration",
  "runtime_generated_record"
]);

export function processLayer08(input) {
  for (const field of REJECTED_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return output(input, 0, "rejected_synthetic_corroboration", [`rejected_field_present:${field}`]);
    }
  }

  const records = Array.isArray(input?.records) ? input.records : [];
  const reasons = [];

  const validRecords = records.filter(record =>
    record &&
    record.record_id &&
    record.source_url &&
    record.claim
  );

  if (validRecords.length === 0) {
    return output(input, 0, "weak_or_uncorroborated", ["no_valid_explicit_records"]);
  }

  const uniqueDomains = new Set(validRecords.map(record => domainOf(record.source_url)).filter(Boolean));
  const uniqueUrls = new Set(validRecords.map(record => String(record.source_url).trim().toLowerCase()).filter(Boolean));
  const authorityScores = validRecords.map(record => Number(record.authority_score || 0));
  const maxAuthority = Math.max(...authorityScores, 0);
  const avgAuthority = authorityScores.reduce((sum, value) => sum + value, 0) / authorityScores.length;

  let score = 0;

  score += Math.min(35, uniqueUrls.size * 12);
  reasons.push(`unique_source_urls:${uniqueUrls.size}`);

  score += Math.min(25, uniqueDomains.size * 10);
  reasons.push(`unique_source_domains:${uniqueDomains.size}`);

  if (maxAuthority >= 85) {
    score += 20;
    reasons.push("primary_authority_present");
  } else if (maxAuthority >= 70) {
    score += 12;
    reasons.push("strong_authority_present");
  }

  if (avgAuthority >= 70) {
    score += 20;
    reasons.push("average_authority_strong");
  } else if (avgAuthority >= 45) {
    score += 10;
    reasons.push("average_authority_moderate");
  }

  score = clamp(score, 0, 100);

  return output(input, score, classify(score, validRecords.length, maxAuthority), reasons);
}

function output(input, score, klass, reasons) {
  return Object.freeze({
    layer_id: "layer_08",
    record_group_id: input?.record_group_id || null,
    entity_key: input?.entity_key || null,
    city_key: input?.city_key || null,
    corroboration_score: score,
    corroboration_class: klass,
    corroboration_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function classify(score, count, maxAuthority) {
  if (score >= 75 && count >= 2) return "strong_multi_source_corroboration";
  if (score >= 50 && count >= 2) return "moderate_multi_source_corroboration";
  if (count === 1 && maxAuthority >= 85) return "single_authoritative_source";
  return "weak_or_uncorroborated";
}

function domainOf(url) {
  try {
    return new URL(String(url)).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}
