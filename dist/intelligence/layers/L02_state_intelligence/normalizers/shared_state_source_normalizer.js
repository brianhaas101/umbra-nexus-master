import crypto from "node:crypto";

export function replayHash(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value, Object.keys(value).sort()))
    .digest("hex");
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeStateSource(raw, config) {
  const html = raw.raw_payload?.html || "";
  const text = stripTags(html).toLowerCase();

  if (!html || html.length < 1000) throw new Error(`${config.source_id} payload too small.`);

  for (const marker of config.identity_markers) {
    if (text.includes(marker)) {
      const signals = config.signal_terms.filter(t => text.includes(t));

      if (signals.length === 0) throw new Error(`${config.source_id} signals missing.`);

      return Object.freeze({
        layer_id: "L02",
        source_id: config.source_id,
        state_code: "CA",
        state_name: "California",
        entity_id: `l02_ca_${config.slug}_${replayHash(raw).slice(0, 16)}`,
        entity_type: config.entity_type,
        source_trace: Object.freeze([raw.source_trace]),
        evidence: Object.freeze([
          Object.freeze({
            evidence_type: config.evidence_type,
            source_url: raw.canonical_url,
            retrieved_at: raw.retrieved_at,
            signals
          })
        ]),
        state_context: Object.freeze({
          state_code: "CA",
          state_name: "California",
          signals: Object.freeze(signals)
        }),
        parser_status: config.parser_status,
        synthetic_fillers_allowed: false,
        inferred_contacts_allowed: false,
        client_paths_touched: false
      });
    }
  }

  throw new Error(`${config.source_id} identity markers not found.`);
}
