const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const national = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const graph = readJson(
  "public/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json"
);

const influence = readJson(
  "public/data/clients/black_dragon/influence/runtime/regional_influence_scoring.v1.json"
);

const entities = national.runtime_entities || [];
const edges = graph.graph_edges || [];

const cityScores = Object.fromEntries(
  (influence.city_scores || []).map(c => [`${c.city}, ${c.region}`, c])
);

const institutionalEcosystems = new Set([
  "EDUCATION",
  "LAW_ENFORCEMENT_MOTOR",
  "VETERAN"
]);

const relationshipScores = edges
  .filter(e =>
    institutionalEcosystems.has(e.source_ecosystem) ||
    institutionalEcosystems.has(e.target_ecosystem)
  )
  .map(e => {
    const cityKey = `${e.source_city}, ${e.source_region}`;
    const cityInfluence = Number(cityScores[cityKey]?.influence_score || 0);

    const institutionalOverlap =
      (
        institutionalEcosystems.has(e.source_ecosystem) ? 1 : 0
      ) +
      (
        institutionalEcosystems.has(e.target_ecosystem) ? 1 : 0
      );

    const credibilityScore = Math.round(
      Math.min(
        100,
        (
          e.propagation_strength * 45 +
          cityInfluence * 0.35 +
          institutionalOverlap * 12
        )
      )
    );

    return {
      relationship_id:
        `BD_INST_REL_${e.edge_id.replace("BD_GRAPH_EDGE_", "")}`,

      source_entity_id:
        e.source_entity_id,

      target_entity_id:
        e.target_entity_id,

      source_ecosystem:
        e.source_ecosystem,

      target_ecosystem:
        e.target_ecosystem,

      city:
        e.source_city,

      region:
        e.source_region,

      relationship_type:
        e.relationship_type,

      propagation_strength:
        e.propagation_strength,

      city_influence_score:
        cityInfluence,

      institutional_overlap:
        institutionalOverlap,

      credibility_score:
        credibilityScore,

      adoption_likelihood_score:
        Math.round(
          credibilityScore * 0.58 +
          cityInfluence * 0.22 +
          institutionalOverlap * 8
        ),

      relationship_tier:
        credibilityScore >= 85 ? "HIGH_TRUST_INSTITUTIONAL" :
        credibilityScore >= 72 ? "STRONG_INSTITUTIONAL" :
        credibilityScore >= 58 ? "MODERATE_INSTITUTIONAL" :
        "REVIEW_RELATIONSHIP",

      outreach_allowed:
        false,

      next_action:
        "VERIFY_RELATIONSHIP_SOURCES_BEFORE_OUTREACH"
    };
  })
  .sort((a, b) =>
    b.adoption_likelihood_score - a.adoption_likelihood_score
  );

const byRegion = {};

for (const r of relationshipScores) {
  if (!byRegion[r.region]) {
    byRegion[r.region] = {
      region: r.region,
      relationships: 0,
      avg_credibility: 0,
      avg_adoption_likelihood: 0,
      high_trust_relationships: 0,
      scores: [],
      adoption_scores: []
    };
  }

  byRegion[r.region].relationships++;
  byRegion[r.region].scores.push(r.credibility_score);
  byRegion[r.region].adoption_scores.push(r.adoption_likelihood_score);

  if (r.relationship_tier === "HIGH_TRUST_INSTITUTIONAL") {
    byRegion[r.region].high_trust_relationships++;
  }
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const regionalInstitutionalIndex = Object.values(byRegion)
  .map(r => ({
    region: r.region,
    relationships: r.relationships,
    high_trust_relationships: r.high_trust_relationships,
    avg_credibility: Number(avg(r.scores).toFixed(2)),
    avg_adoption_likelihood: Number(avg(r.adoption_scores).toFixed(2)),
    outreach_allowed: false,
    next_action: "VERIFY_REGION_INSTITUTIONAL_SOURCES"
  }))
  .sort((a, b) => b.avg_adoption_likelihood - a.avg_adoption_likelihood);

const payload = {
  version: "black_dragon_institutional_relationship_scoring_v1_batch_081",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "institutional_relationship_scoring_v1",

  totals: {
    relationships: relationshipScores.length,
    regions: regionalInstitutionalIndex.length,
    outreach_allowed: 0
  },

  top_relationships: relationshipScores.slice(0, 50),
  top_regions: regionalInstitutionalIndex.slice(0, 20),
  relationship_scores: relationshipScores,
  regional_institutional_index: regionalInstitutionalIndex
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/institutional/runtime/institutional_relationship_scoring.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/institutional/relationships/institutional_relationship_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_institutional_relationship_index_v1_batch_081",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    relationships: relationshipScores
  }, null, 2)
);

console.log(JSON.stringify({
  status: "INSTITUTIONAL_RELATIONSHIP_SCORING_COMPLETE",
  totals: payload.totals,
  top_regions: payload.top_regions.slice(0, 5),
  top_relationships: payload.top_relationships.slice(0, 5).map(r => ({
    city: r.city,
    region: r.region,
    source: r.source_ecosystem,
    target: r.target_ecosystem,
    credibility: r.credibility_score,
    adoption: r.adoption_likelihood_score,
    tier: r.relationship_tier
  }))
}, null, 2));
