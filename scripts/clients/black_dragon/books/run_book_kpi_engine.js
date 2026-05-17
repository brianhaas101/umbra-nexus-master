const fs = require("fs");
const path = require("path");

const targetsPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const configPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_kpi_config.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const cfg = config.assumptions;

function estimateConversionRate(temp) {

  if (temp === "HOT") {
    return cfg.hot_lead_conversion_rate;
  }

  if (temp === "WARM") {
    return cfg.warm_lead_conversion_rate;
  }

  return cfg.review_lead_conversion_rate;
}

function estimateMultiplier(temp) {

  if (temp === "HOT") {
    return cfg.endorsement_multiplier_hot;
  }

  if (temp === "WARM") {
    return cfg.endorsement_multiplier_warm;
  }

  return cfg.endorsement_multiplier_review;
}

const enriched = targets.map(t => {

  const conversionRate =
    estimateConversionRate(t.lead_temperature);

  const multiplier =
    estimateMultiplier(t.lead_temperature);

  const projectedDirectOrders =
    Math.round(
      conversionRate *
      cfg.average_bulk_order_size
    );

  const projectedMemberOrders =
    Math.round(
      projectedDirectOrders *
      multiplier
    );

  const projectedRevenue =
    Number(
      (
        projectedMemberOrders *
        cfg.average_book_price
      ).toFixed(2)
    );

  return {

    ...t,

    estimated_conversion_rate:
      conversionRate,

    projected_direct_orders:
      projectedDirectOrders,

    projected_member_orders:
      projectedMemberOrders,

    projected_revenue:
      projectedRevenue,

    projected_endorsement_multiplier:
      multiplier
  };
});

const totals = {

  total_targets:
    enriched.length,

  hot_targets:
    enriched.filter(t => t.lead_temperature === "HOT").length,

  warm_targets:
    enriched.filter(t => t.lead_temperature === "WARM").length,

  review_targets:
    enriched.filter(t => t.lead_temperature === "REVIEW").length,

  total_projected_direct_orders:
    enriched.reduce(
      (acc,t) => acc + t.projected_direct_orders,
      0
    ),

  total_projected_member_orders:
    enriched.reduce(
      (acc,t) => acc + t.projected_member_orders,
      0
    ),

  total_projected_revenue:
    Number(
      enriched.reduce(
        (acc,t) => acc + t.projected_revenue,
        0
      ).toFixed(2)
    )
};

const payload = {
  version: "black_dragon_books_operational_kpis_v1",
  generated_at: new Date().toISOString(),

  assumptions: cfg,

  totals,

  top_projected_targets:
    enriched
      .sort((a,b) =>
        (b.projected_revenue || 0) -
        (a.projected_revenue || 0)
      )
      .slice(0, 25),

  targets: enriched
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status: "BOOK_KPI_ENGINE_COMPLETE",
  totals,
  output: outputPath
}, null, 2));
