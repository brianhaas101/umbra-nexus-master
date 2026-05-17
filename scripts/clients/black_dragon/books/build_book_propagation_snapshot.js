const fs = require("fs");
const path = require("path");

const chainsPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/chains/book_propagation_chains.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/snapshots/book_propagation_snapshot.v1.json"
);

const chains = JSON.parse(fs.readFileSync(chainsPath, "utf8"));

const snapshot = {
  version: "black_dragon_books_propagation_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_chains: chains.length,
    open: chains.filter(c => c.chain_status === "OPEN").length,
    active: chains.filter(c => c.chain_status === "ACTIVE").length,
    converted: chains.filter(c => c.chain_status === "CONVERTED").length,
    closed: chains.filter(c => c.chain_status === "CLOSED").length,
    inactive: chains.filter(c => c.chain_status === "INACTIVE").length,

    downstream_orders: chains.reduce((acc, c) => acc + (c.downstream_orders || 0), 0),

    downstream_revenue: Number(
      chains.reduce((acc, c) => acc + (c.downstream_revenue || 0), 0).toFixed(2)
    )
  },

  top_chains:
    chains
      .sort((a,b) => (b.downstream_revenue || 0) - (a.downstream_revenue || 0))
      .slice(0, 25)
      .map(c => ({
        chain_id: c.chain_id,
        source_organization_name: c.source_organization_name,
        source_role: c.source_role,
        chain_status: c.chain_status,
        downstream_orders: c.downstream_orders,
        downstream_revenue: c.downstream_revenue,
        endorsement_type: c.endorsement_type
      }))
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_SNAPSHOT_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
