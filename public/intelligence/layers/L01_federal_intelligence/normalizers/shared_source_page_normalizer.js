import { replayHash } from "../runtime/l01_replay_hash.js";

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripTags(match[1]) : null;
}

function extractSignals(html, terms) {
  const text = stripTags(html).toLowerCase();
  const out = [];

  for (const term of terms) {
    if (text.includes(term)) out.push(term);
  }

  return [...new Set(out)];
}

export function buildNormalizer(config) {
  return function normalizeRecord(rawEnvelope) {
    const html = rawEnvelope.raw_payload?.html || "";
    const lower = html.toLowerCase();

    if (!html || html.length < 1000) {
      throw new Error(`${config.source_id} page fetch too small.`);
    }

    for (const marker of config.identity_markers) {
      if (lower.includes(marker)) {
        const signals = extractSignals(html, config.signal_terms);

        if (signals.length === 0) {
          throw new Error(`${config.source_id} signals missing.`);
        }

        return Object.freeze({
          layer_id: "L01",
          source_id: config.source_id,
          entity_id: `l01_${config.entity_slug}_${replayHash(rawEnvelope).slice(0,16)}`,
          entity_type: config.entity_type,
          source_trace: Object.freeze([rawEnvelope.source_trace]),
          score_components: Object.freeze([
            Object.freeze({
              score_name: "authority_score",
              score_value: config.authority_score,
              basis: config.authority_basis
            }),
            Object.freeze({
              score_name: "signal_score",
              score_value: config.signal_score,
              basis: config.signal_basis
            })
          ]),
          evidence: Object.freeze([
            Object.freeze({
              evidence_type: config.evidence_type,
              source_url: rawEnvelope.canonical_url,
              retrieved_at: rawEnvelope.retrieved_at,
              page_title: extractTitle(html),
              signals
            })
          ]),
          federal_context: Object.freeze({
            page_title: extractTitle(html),
            signals: Object.freeze(signals)
          }),
          parser_status: config.parser_status,
          synthetic_fillers_allowed: false,
          inferred_contacts_allowed: false,
          client_path_coupling: false
        });
      }
    }

    throw new Error(`${config.source_id} identity markers not found.`);
  };
}
