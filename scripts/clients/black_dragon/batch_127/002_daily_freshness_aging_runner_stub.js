const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function write(rel, data) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

const freshnessSnapshot = read(
  "public/data/clients/black_dragon/automation/simulation/freshness/long_beach_freshness_snapshot.json"
);

const aged = freshnessSnapshot.freshness.map(row => {
  const simulatedAgeDays = Number(row.signal_age_days || 0) + 1;

  let decay = 1.0;

  if (simulatedAgeDays > 120) decay = 0.75;
  else if (simulatedAgeDays > 90) decay = 0.85;
  else if (simulatedAgeDays > 45) decay = 0.92;

  const agedFreshness =
    Math.max(0, Number(row.freshness_score || 0) * decay);

  return {
    ...row,
    signal_age_days: simulatedAgeDays,
    freshness_score: Number(agedFreshness.toFixed(2)),
    stale_status:
      simulatedAgeDays > 120
        ? "STALE_REVALIDATION_REQUIRED"
        : simulatedAgeDays > 45
          ? "AGING_MONITOR"
          : "FRESH",
    revalidation_required:
      simulatedAgeDays > 120
  };
});

const out = {
  version: "black_dragon_daily_freshness_aging_run_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_entities: aged.length,
  aged_entities: aged,
  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

write(
  "public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json",
  out
);

console.log(JSON.stringify({
  status: "DAILY_FRESHNESS_AGING_RUNNER_STUB_COMPLETE",
  total_entities: aged.length,
  output: "public/data/clients/black_dragon/automation/freshness_aging/long_beach_daily_freshness_aging_run.json"
}, null, 2));
