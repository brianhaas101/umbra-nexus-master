const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_hotwarm_index.v1.json"
);

const targets = JSON.parse(fs.readFileSync(operationalPath, "utf8"));

const hot = targets.filter(t =>
  t.lead_temperature === "HOT"
);

const warm = targets.filter(t =>
  t.lead_temperature === "WARM"
);

const review = targets.filter(t =>
  t.lead_temperature === "REVIEW"
);

const index = {
  version: "black_dragon_books_hotwarm_index_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: targets.length,
    hot: hot.length,
    warm: warm.length,
    review: review.length
  },

  hot_targets:
    hot
      .sort((a,b) =>
        (b.propagation_score || 0) -
        (a.propagation_score || 0)
      )
      .slice(0, 25),

  warm_targets:
    warm
      .sort((a,b) =>
        (b.propagation_score || 0) -
        (a.propagation_score || 0)
      )
      .slice(0, 50)
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(index, null, 2)
);

console.log(JSON.stringify({
  status: "HOT_WARM_INDEX_BUILD_COMPLETE",
  totals: index.totals,
  output: outputPath
}, null, 2));
