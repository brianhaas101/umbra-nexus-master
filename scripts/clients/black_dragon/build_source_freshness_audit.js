const fs = require("fs");
const path = require("path");

const REGISTRY = "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json";
const OUT = "public/data/clients/black_dragon/source_freshness_audit.json";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function daysOld(dateString) {
  if (!dateString) return null;
  const t = new Date(dateString).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

const reg = readJson(REGISTRY);

const sources = [];

for (const state of reg.states || []) {
  for (const source of state.sources || []) {
    const age = daysOld(source.last_verified_at);

    sources.push({
      state: state.state_code,
      type: source.type,
      url: source.url,
      verified: source.verified === true,
      last_verified_at: source.last_verified_at || null,
      age_days: age,
      freshness_status:
        age === null ? "UNKNOWN" :
        age <= 30 ? "FRESH" :
        age <= 90 ? "AGING" :
        "STALE"
    });
  }
}

const output = {
  version: "black_dragon_source_freshness_audit_v1",
  generated_at: new Date().toISOString(),
  total_sources: sources.length,
  sources
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[FRESHNESS AUDIT] COMPLETE");
console.log("[FRESHNESS AUDIT] Sources:", sources.length);
