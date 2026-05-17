import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "doj_announcements";

function strip(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractItems(xml) {
  const items = [];
  const blocks = String(xml || "").match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const block of blocks.slice(0, 25)) {
    const title = strip((block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]);
    const link = strip((block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1]);
    const pubDate = strip((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1]);

    if (title || link) {
      items.push(Object.freeze({ title, link, pubDate }));
    }
  }

  return items;
}

export function normalizeRecord(rawEnvelope) {
  if (rawEnvelope.layer_id !== "L01") throw new Error("Invalid layer_id.");
  if (rawEnvelope.source_id !== SOURCE_ID) throw new Error("Invalid source_id.");

  const xml = rawEnvelope.raw_payload?.xml || "";

  if (!xml.includes("<rss") || !xml.toLowerCase().includes("justice news")) {
    throw new Error("DOJ RSS identity markers not found.");
  }

  const items = extractItems(xml);

  if (items.length === 0) throw new Error("DOJ RSS contained zero items.");

  return Object.freeze({
    layer_id: "L01",
    source_id: SOURCE_ID,
    entity_id: `l01_doj_rss_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_justice_rss_feed",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({ score_name: "authority_score", score_value: 95, basis: "official_doj_rss_feed" }),
      Object.freeze({ score_name: "freshness_score", score_value: 100, basis: "retrieved_during_current_run" })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "official_rss_feed_fetch",
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        item_count: items.length
      })
    ]),
    federal_context: Object.freeze({
      item_count: items.length,
      items: Object.freeze(items)
    }),
    parser_status: "rss_verified_doj_items",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_path_coupling: false
  });
}
