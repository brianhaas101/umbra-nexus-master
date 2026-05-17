const fs = require("fs");
const path = require("path");

const trackingPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/chains/book_propagation_chains.v1.json"
);

const tracking = JSON.parse(fs.readFileSync(trackingPath, "utf8"));

const now = new Date().toISOString();

const chains = tracking.map((t, index) => ({
  chain_id: `BD_BOOK_CHAIN_${String(index + 1).padStart(6, "0")}`,

  source_entity_id: t.entity_id,
  source_organization_name: t.organization_name,
  source_target_name: t.target_name || "UNKNOWN_LEADER",
  source_role: t.leader_role || "UNKNOWN",

  source_lead_temperature: t.lead_temperature || "REVIEW",
  source_propagation_score: t.propagation_score || 0,

  chain_status: "OPEN",

  events: [],

  downstream_orders: 0,
  downstream_revenue: 0,
  downstream_organizations: [],

  endorsement_type: null,
  adoption_notes: null,

  created_at: now,
  updated_at: now
}));

fs.writeFileSync(outputPath, JSON.stringify(chains, null, 2));

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_CHAINS_CREATED",
  chains: chains.length,
  output: outputPath
}, null, 2));
