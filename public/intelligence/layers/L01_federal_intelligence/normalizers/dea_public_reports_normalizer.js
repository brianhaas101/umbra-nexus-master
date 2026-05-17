import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "dea_public_reports";
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

  for (const term of ["dea", "drug enforcement", "fentanyl", "opioid", "trafficking", "press release", "enforcement"]) {
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
    throw new Error("DEA page fetch too small to verify.");
  }

  if (!lower.includes("dea") && !lower.includes("drug enforcement")) {
    throw new Error("DEA identity markers not found.");
  }

  const signals = extractSignals(html);

  if (signals.length === 0) {
    throw new Error("DEA signal markers not found.");
  }

  const title = extractTitle(html);

  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    entity_id: `l01_dea_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_drug_enforcement_source_page",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({
        score_name: "authority_score",
        score_value: 92,
        basis: "official_dea_public_press_release_page"
      }),
      Object.freeze({
        score_name: "risk_signal_score",
        score_value: 88,
        basis: "dea_enforcement_terms_present"
      }),
      Object.freeze({
        score_name: "freshness_score",
        score_value: 100,
        basis: "retrieved_during_current_run"
      })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "public_html_dea_press_release_fetch",
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
    parser_status: "source_page_verified_dea_signals",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_path_coupling: false
  });
}
