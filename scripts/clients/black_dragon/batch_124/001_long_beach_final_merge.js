const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

const sources = [
  ["RIDER_COMMUNITY_ORG", "public/data/clients/black_dragon/organization_import/dossiers/long_beach_ranked_dossiers.json"],
  ["EVENT_MEDIA", "public/data/clients/black_dragon/event_media_layer/dossiers/long_beach_event_media_ranked_dossiers.json"],
  ["RETAIL_PHYSICAL_CHANNEL", "public/data/clients/black_dragon/retail_channels/dossiers/long_beach_retail_channel_ranked_dossiers.json"],
  ["CLUB_ASSOCIATION", "public/data/clients/black_dragon/club_association_layer/dossiers/long_beach_club_association_ranked_dossiers.json"],
  ["SUPPORT_INFRASTRUCTURE", "public/data/clients/black_dragon/support_infrastructure_layer/dossiers/long_beach_support_infrastructure_ranked_dossiers.json"],
  ["BULK_ORDER", "public/data/clients/black_dragon/bulk_order_layer/dossiers/long_beach_bulk_order_ranked_dossiers.json"],
  ["ONLINE_DISTRIBUTION", "public/data/clients/black_dragon/online_distribution_layer/dossiers/long_beach_online_distribution_ranked_dossiers.json"],
  ["CONVERSION_STRATEGY", "public/data/clients/black_dragon/conversion_strategy_layer/dossiers/long_beach_conversion_strategy_ranked_dossiers.json"],
  ["CULTURE_PROPAGATION", "public/data/clients/black_dragon/culture_expansion_layer/dossiers/long_beach_culture_expansion_ranked_dossiers.json"]
];

const contactQueue = read(
  "public/data/clients/black_dragon/contact_resolution/long_beach/review_queue/long_beach_client_action_queue.json"
);

const contactMap = new Map();

if (contactQueue && Array.isArray(contactQueue.queue)) {
  for (const q of contactQueue.queue) {
    contactMap.set(String(q.organization_name || "").toLowerCase().trim(), q);
  }
}

function normName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\b(digital|online audience|leadership|vendor network|distribution network|community events team|riding community organizers|california|southern california|long beach|events|event|magazine|digital motorcycle culture|youtube community|community)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const aliases = {
  "hot bike": "hot bike",
  "cycle source": "cycle source",
  "born free motorcycle show": "born free motorcycle show",
  "biker trash network": "biker trash network",
  "bike shed moto co": "bike shed moto",
  "bike shed moto online": "bike shed moto",
  "combat veterans motorcycle association chapter 33 12": "combat veterans motorcycle association chapter 33 12",
  "southern motorcycling association": "southern motorcycling association",
  "harley davidson of": "harley davidson",
  "roland sands design": "roland sands design",
  "biltwell": "biltwell",
  "chopcult": "chopcult",
  "dice": "dice",
  "lowbrow customs garage podcast": "lowbrow customs",
  "cycledrag motorcycle": "cycledrag",
  "love ride foundation network": "love ride foundation",
  "bikers against child abuse": "bikers against child abuse",
  "outer limits tattoo": "outer limits tattoo"
};

function canonicalKey(name) {
  const n = normName(name);
  for (const [needle, canonical] of Object.entries(aliases)) {
    if (n.includes(needle)) return canonical;
  }
  return n;
}

const rawRows = [];
const mergedMap = new Map();

for (const [layer, rel] of sources) {
  const data = read(rel);
  if (!data || !Array.isArray(data.dossiers)) continue;

  for (const d of data.dossiers) {
    const key = canonicalKey(d.organization_name);

    rawRows.push({
      layer,
      canonical_key: key,
      organization_name: d.organization_name,
      score: d.composite_rank_score || d.best_score || 0
    });

    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        canonical_key: key,
        organization_name: d.organization_name,
        city: d.city || "Long Beach",
        state: d.state || "CA",
        source_layers: [],
        source_records: [],
        organization_types: [],
        recommended_conversion_paths: [],
        recommended_actions: [],
        best_score: 0,
        max_book_sale_relevance: 0,
        priority_tiers: [],
        contact_ready: false,
        public_contact_url: null,
        contact_route_type: null,
        client_action_available: false,
        outreach_execution_status: "NOT_CONTACT_READY",
        dossier_visible: true,
        city_map_visible: true,
        automated_outreach_allowed: false,
        promotion_allowed: false
      });
    }

    const m = mergedMap.get(key);

    if (!m.source_layers.includes(layer)) m.source_layers.push(layer);

    m.source_records.push({
      layer,
      dossier_id: d.dossier_id || null,
      organization_name: d.organization_name,
      organization_type: d.organization_type || null,
      composite_rank_score: Number(d.composite_rank_score || d.best_score || 0),
      priority_tier: d.priority_tier || "REVIEW",
      source_url: d.source_url || null,
      rank_reason: d.rank_reason || d.evidence_note || null
    });

    if (d.organization_type && !m.organization_types.includes(d.organization_type)) {
      m.organization_types.push(d.organization_type);
    }

    if (d.recommended_conversion_path && !m.recommended_conversion_paths.includes(d.recommended_conversion_path)) {
      m.recommended_conversion_paths.push(d.recommended_conversion_path);
    }

    if (d.recommended_action && !m.recommended_actions.includes(d.recommended_action)) {
      m.recommended_actions.push(d.recommended_action);
    }

    m.best_score = Math.max(m.best_score, Number(d.composite_rank_score || d.best_score || 0));
    m.max_book_sale_relevance = Math.max(m.max_book_sale_relevance, Number(d.book_sale_relevance || 0));

    if (d.priority_tier && !m.priority_tiers.includes(d.priority_tier)) {
      m.priority_tiers.push(d.priority_tier);
    }
  }
}

const merged = Array.from(mergedMap.values()).map((m, index) => {
  const exact = contactMap.get(String(m.organization_name || "").toLowerCase().trim());

  let aliasHit = exact;
  if (!aliasHit) {
    for (const q of contactMap.values()) {
      if (canonicalKey(q.organization_name) === m.canonical_key) {
        aliasHit = q;
        break;
      }
    }
  }

  return {
    city_runtime_entity_id: `BD_LB_FINAL_ENTITY_${String(index + 1).padStart(5, "0")}`,
    ...m,
    source_layer_count: m.source_layers.length,
    priority_tier:
      m.best_score >= 8.75 ? "HOT" :
      m.best_score >= 8.0 ? "WARM" :
      "REVIEW",
    contact_ready: !!aliasHit,
    client_action_available: !!aliasHit,
    public_contact_url: aliasHit ? aliasHit.public_contact_url : null,
    contact_route_type: aliasHit ? aliasHit.contact_route_type : null,
    outreach_execution_status: aliasHit ? "CLIENT_MANUAL_ONLY" : "NOT_CONTACT_READY",
    contact_route_status: aliasHit ? "VERIFIED_PUBLIC_ROUTE" : "NOT_CONTACT_READY_UNTIL_ROUTE_VERIFIED",
    automated_outreach_allowed: false,
    promotion_allowed: false,
    city_runtime_status: "FINAL_MERGED_DEDUPED_VISIBLE"
  };
})
.sort((a,b) => {
  if (b.best_score !== a.best_score) return b.best_score - a.best_score;
  return b.source_layer_count - a.source_layer_count;
})
.map((m, index) => ({
  ...m,
  city_rank: index + 1
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_final_merged_city_entities_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  raw_layer_rows: rawRows.length,
  deduped_city_entities: merged.length,
  contact_ready_entities: merged.filter(e => e.contact_ready).length,
  merged_entities: merged
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_FINAL_MERGE_COMPLETE",
  raw_layer_rows: rawRows.length,
  deduped_city_entities: merged.length,
  contact_ready_entities: merged.filter(e => e.contact_ready).length,
  output: out
}, null, 2));
