const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

const sources = [
  {
    layer: "RIDER_COMMUNITY_ORG",
    path: "public/data/clients/black_dragon/organization_import/dossiers/long_beach_ranked_dossiers.json"
  },
  {
    layer: "EVENT_MEDIA",
    path: "public/data/clients/black_dragon/event_media_layer/dossiers/long_beach_event_media_ranked_dossiers.json"
  },
  {
    layer: "RETAIL_PHYSICAL_CHANNEL",
    path: "public/data/clients/black_dragon/retail_channels/dossiers/long_beach_retail_channel_ranked_dossiers.json"
  },
  {
    layer: "CLUB_ASSOCIATION",
    path: "public/data/clients/black_dragon/club_association_layer/dossiers/long_beach_club_association_ranked_dossiers.json"
  },
  {
    layer: "SUPPORT_INFRASTRUCTURE",
    path: "public/data/clients/black_dragon/support_infrastructure_layer/dossiers/long_beach_support_infrastructure_ranked_dossiers.json"
  },
  {
    layer: "BULK_ORDER",
    path: "public/data/clients/black_dragon/bulk_order_layer/dossiers/long_beach_bulk_order_ranked_dossiers.json"
  },
  {
    layer: "ONLINE_DISTRIBUTION",
    path: "public/data/clients/black_dragon/online_distribution_layer/dossiers/long_beach_online_distribution_ranked_dossiers.json"
  },
  {
    layer: "CONVERSION_STRATEGY",
    path: "public/data/clients/black_dragon/conversion_strategy_layer/dossiers/long_beach_conversion_strategy_ranked_dossiers.json"
  }
];

function normName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\b(digital|online audience|leadership|vendor network|distribution network|community events team|riding community organizers|california|southern california|long beach|events|event|magazine|digital motorcycle culture)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const mergedMap = new Map();
const rawRows = [];

for (const src of sources) {
  const data = read(src.path);
  if (!data || !Array.isArray(data.dossiers)) continue;

  for (const d of data.dossiers) {
    const canonical_key = normName(d.organization_name);

    rawRows.push({
      layer: src.layer,
      canonical_key,
      ...d
    });

    if (!mergedMap.has(canonical_key)) {
      mergedMap.set(canonical_key, {
        canonical_key,
        organization_name: d.organization_name,
        city: d.city || "Long Beach",
        state: d.state || "CA",
        source_layers: [],
        source_records: [],
        organization_types: [],
        best_score: 0,
        max_book_sale_relevance: 0,
        priority_tiers: [],
        recommended_conversion_paths: [],
        recommended_actions: [],
        contact_ready: false,
        automated_outreach_allowed: false,
        promotion_allowed: false,
        dossier_visible: true,
        city_map_visible: true
      });
    }

    const m = mergedMap.get(canonical_key);

    m.source_layers.push(src.layer);
    m.source_records.push({
      layer: src.layer,
      dossier_id: d.dossier_id || null,
      organization_name: d.organization_name,
      organization_type: d.organization_type || null,
      composite_rank_score: d.composite_rank_score || 0,
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

    m.best_score = Math.max(m.best_score, Number(d.composite_rank_score || 0));
    m.max_book_sale_relevance = Math.max(m.max_book_sale_relevance, Number(d.book_sale_relevance || 0));

    if (d.priority_tier && !m.priority_tiers.includes(d.priority_tier)) {
      m.priority_tiers.push(d.priority_tier);
    }

    m.contact_ready = false;
    m.automated_outreach_allowed = false;
    m.promotion_allowed = false;
  }
}

const merged = Array.from(mergedMap.values())
  .map((m, index) => ({
    city_runtime_entity_id:
      `BD_LB_CITY_ENTITY_${String(index + 1).padStart(5, "0")}`,

    ...m,

    source_layers:
      Array.from(new Set(m.source_layers)),

    source_layer_count:
      Array.from(new Set(m.source_layers)).length,

    priority_tier:
      m.best_score >= 8.75
        ? "HOT"
        : m.best_score >= 8.0
          ? "WARM"
          : "REVIEW",

    city_runtime_status:
      "MERGED_DEDUPED_VISIBLE",

    contact_route_status:
      "NOT_CONTACT_READY_UNTIL_ROUTE_VERIFIED"
  }))
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
  "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_merged_city_entities_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  raw_layer_rows: rawRows.length,
  deduped_city_entities: merged.length,
  merged_entities: merged
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_LAYER_MERGE_COMPLETE",
  raw_layer_rows: rawRows.length,
  deduped_city_entities: merged.length,
  output: out
}, null, 2));
