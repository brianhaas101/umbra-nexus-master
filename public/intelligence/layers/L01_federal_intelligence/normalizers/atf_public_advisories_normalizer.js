import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "atf_public_advisories";
export const LAYER_ID = "L01";
export const NORMALIZER_ACTIVE = true;

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : null;
}

function extractSignals(html) {
  const text = stripTags(html).toLowerCase();
  const signals = [];

  for (const term of ["atf", "firearms", "explosives", "arson", "enforcement", "public safety", "news"]) {
    if (text.includes(term)) signals.push(term);
  }

  return [...new Set(signals)];
}

export function normalizeRecord(rawEnvelope) {
  if (!NORMALIZER_ACTIVE) throw new Error("Normalizer inactive.");
  if (rawEnvelope.layer_id !== "L01") throw new Error("Invalid layer_id.");
  if (rawEnvelope.source_id !== SOURCE_ID) throw new Error("Invalid source_id.");

  const html = rawEnvelope.raw_payload?.html || "";
  const lower = html.toLowerCase();

  if (!html || html.length < 1000) {
    throw new Error("ATF page fetch too small to verify.");
  }

  if (!lower.includes("atf") && !lower.includes("bureau of alcohol")) {
    throw new Error("ATF identity markers not found.");
  }

  const signals = extractSignals(html);

  if (signals.length === 0) {
    throw new Error("ATF signal markers not found.");
  }

  const title = extractTitle(html);

  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    entity_id: `l01_atf_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_law_enforcement_advisory_source_page",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({
        score_name: "authority_score",
        score_value: 92,
        basis: "official_atf_public_news_page"
      }),
      Object.freeze({
        score_name: "risk_signal_score",
        score_value: 85,
        basis: "atf_public_safety_terms_present"
      }),
      Object.freeze({
        score_name: "freshness_score",
        score_value: 100,
        basis: "retrieved_during_current_run"
      })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "public_html_atf_news_fetch",
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        page_title: title,
        signals
      })
    ]),
    federal_context: Object.freeze({
      page_title: title,
      signals: Object.freeze(signals)
    }),
    parser_status: "source_page_verified_atf_signals",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}
