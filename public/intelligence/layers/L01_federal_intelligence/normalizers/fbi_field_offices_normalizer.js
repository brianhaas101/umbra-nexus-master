import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "fbi_field_offices";

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countOfficeSignals(html) {
  const text = stripTags(html).toLowerCase();
  const known = [
    "albany", "albuquerque", "anchorage", "atlanta", "baltimore",
    "birmingham", "boston", "buffalo", "charlotte", "chicago",
    "cincinnati", "cleveland", "columbia", "dallas", "denver",
    "detroit", "el paso", "honolulu", "houston", "indianapolis",
    "jackson", "jacksonville", "kansas city", "knoxville", "las vegas",
    "little rock", "los angeles", "louisville", "memphis", "miami",
    "milwaukee", "minneapolis", "mobile", "new haven", "new orleans",
    "new york", "newark", "norfolk", "oklahoma city", "omaha",
    "philadelphia", "phoenix", "pittsburgh", "portland", "richmond",
    "sacramento", "salt lake city", "san antonio", "san diego",
    "san francisco", "san juan", "seattle", "springfield", "st. louis",
    "tampa", "washington"
  ];

  return known.filter(name => text.includes(name));
}

export function normalizeRecord(rawEnvelope) {
  if (rawEnvelope.layer_id !== "L01") throw new Error("Invalid layer_id.");
  if (rawEnvelope.source_id !== SOURCE_ID) throw new Error("Invalid source_id.");

  const html = rawEnvelope.raw_payload?.html || "";
  const lower = html.toLowerCase();

  if (!lower.includes("field offices") || !lower.includes("fbi")) {
    throw new Error("FBI field office identity markers not found.");
  }

  const offices = countOfficeSignals(html);

  if (offices.length < 40) {
    throw new Error(`Expected at least 40 FBI field office signals. Found ${offices.length}.`);
  }

  return Object.freeze({
    layer_id: "L01",
    source_id: SOURCE_ID,
    entity_id: `l01_fbi_field_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_law_enforcement_field_office_directory",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({ score_name: "authority_score", score_value: 90, basis: "official_fbi_field_office_directory" }),
      Object.freeze({ score_name: "federal_relevance_score", score_value: 95, basis: "field_office_directory_signals" })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "official_field_office_directory_fetch",
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        office_signal_count: offices.length
      })
    ]),
    federal_context: Object.freeze({
      office_signal_count: offices.length,
      offices: Object.freeze(offices)
    }),
    parser_status: "source_page_verified_fbi_field_office_signals",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_path_coupling: false
  });
}
