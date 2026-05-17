const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ca_post_law_enforcement_agencies";

const htmlPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.html`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.candidates.json`
);

function clean(t) {
  return String(t || "").replace(/\s+/g, " ").trim();
}

// VERY tolerant extraction: grabs link text + city-like patterns
function extractCandidates(html) {
  const matches = [...html.matchAll(/<a[^>]*>(.*?)<\/a>/gi)];

  return matches
    .map((m, i) => {
      const text = clean(m[1]);

      if (!text || text.length < 5) return null;
      if (!/POLICE|SHERIFF/i.test(text)) return null;

      return {
        candidate_id: `CA-POST-${String(i).padStart(5, "0")}`,
        agency_name: text,
        state: "CA",
        source: SOURCE_ID,
        review_status: "ca_post_review_required"
      };
    })
    .filter(Boolean);
}

function main() {
  console.log("[CA PARSER] Starting...");

  const html = fs.readFileSync(htmlPath, "utf8");
  const candidates = extractCandidates(html);

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        source_id: SOURCE_ID,
        generated_at: new Date().toISOString(),
        candidate_count: candidates.length,
        candidates
      },
      null,
      2
    )
  );

  console.log("[CA PARSER] Candidates:", candidates.length);
  console.log("[CA PARSER] Output:", outPath);
}

main();