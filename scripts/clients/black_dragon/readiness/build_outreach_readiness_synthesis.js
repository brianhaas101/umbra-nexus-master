const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const national = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const influence = readJson(
  "public/data/clients/black_dragon/influence/runtime/regional_influence_scoring.v1.json"
);

const distribution = readJson(
  "public/data/clients/black_dragon/distribution_density/runtime/distribution_density_mapping.v1.json"
);

const institutional = readJson(
  "public/data/clients/black_dragon/institutional/runtime/institutional_relationship_scoring.v1.json"
);

const graph = readJson(
  "public/data/clients/black_dragon/graph/indexes/graph_index.v1.json"
);

const entities = national.runtime_entities || [];
const graphIndex = graph.graph_index || {};

const cityInfluence = Object.fromEntries(
  (influence.city_scores || []).map(c => [`${c.city}, ${c.region}`, c])
);

const cityDistribution = Object.fromEntries(
  (distribution.city_distribution_density || []).map(c => [`${c.city}, ${c.region}`, c])
);

const institutionalByCity = {};

for (const rel of institutional.relationship_scores || []) {
  const key = `${rel.city}, ${rel.region}`;

  if (!institutionalByCity[key]) {
    institutionalByCity[key] = {
      count: 0,
      credibility: [],
      adoption: []
    };
  }

  institutionalByCity[key].count++;
  institutionalByCity[key].credibility.push(Number(rel.credibility_score || 0));
  institutionalByCity[key].adoption.push(Number(rel.adoption_likelihood_score || 0));
}

function avg(arr) {
  if (!arr || !arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clamp100(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tier(score) {
  if (score >= 88) return "VERIFY_FIRST";
  if (score >= 76) return "HIGH_PRIORITY_VERIFICATION";
  if (score >= 64) return "PRIORITY_REVIEW";
  if (score >= 52) return "SECONDARY_REVIEW";
  return "HOLD";
}

const synthesized = entities.map(entity => {
  const cityKey = `${entity.city}, ${entity.region}`;

  const influenceScore =
    Number(cityInfluence[cityKey]?.influence_score || 0);

  const distributionScore =
    Number(cityDistribution[cityKey]?.distribution_density_score || 0);

  const inst =
    institutionalByCity[cityKey] || {
      count: 0,
      credibility: [],
      adoption: []
    };

  const institutionalCredibility =
    avg(inst.credibility);

  const institutionalAdoption =
    avg(inst.adoption);

  const propagationScore =
    Math.min(
      100,
      Number(graphIndex[entity.entity_id]?.propagation_score || 0) / 2
    );

  const basePriority =
    Number(entity.national_priority_score || 0);

  const readinessScore = clamp100(
    basePriority * 0.18 +
    influenceScore * 0.18 +
    distributionScore * 0.16 +
    institutionalCredibility * 0.18 +
    institutionalAdoption * 0.14 +
    propagationScore * 0.16
  );

  const sourceVerified =
    entity.verification_status === "SOURCE_DISCOVERED" ||
    entity.verification_status === "CONTACT_VERIFIED" ||
    entity.verification_status === "OUTREACH_ELIGIBLE";

  const contactVerified =
    entity.contact_status === "CONTACT_VERIFIED";

  const outreachAllowed =
    sourceVerified &&
    contactVerified &&
    entity.outreach_allowed === true;

  return {
    entity_id:
      entity.entity_id,

    organization_name:
      entity.organization_name,

    city:
      entity.city,

    region:
      entity.region,

    country:
      entity.country,

    ecosystem:
      entity.ecosystem,

    entity_class:
      entity.entity_class,

    source_category:
      entity.source_category,

    readiness_score:
      readinessScore,

    readiness_tier:
      tier(readinessScore),

    contributing_scores: {
      base_priority:
        basePriority,

      city_influence:
        influenceScore,

      distribution_density:
        distributionScore,

      institutional_credibility:
        Number(institutionalCredibility.toFixed(2)),

      institutional_adoption:
        Number(institutionalAdoption.toFixed(2)),

      propagation:
        Number(propagationScore.toFixed(2))
    },

    gates: {
      source_verified:
        sourceVerified,

      contact_verified:
        contactVerified,

      outreach_allowed:
        outreachAllowed,

      verification_status:
        entity.verification_status,

      contact_status:
        entity.contact_status
    },

    operational_status:
      outreachAllowed
        ? "OUTREACH_READY"
        : "VERIFICATION_REQUIRED",

    next_action:
      outreachAllowed
        ? "QUEUE_FOR_OUTREACH"
        : "VERIFY_PUBLIC_SOURCE_AND_CONTACT_ROUTE",

    forbidden_actions:
      outreachAllowed
        ? []
        : [
            "NO_OUTREACH",
            "NO_AUTO_CONTACT",
            "NO_RESPONSE_GENERATION",
            "NO_QUEUE_INSERTION_UNTIL_VERIFIED"
          ]
  };
}).sort((a, b) => b.readiness_score - a.readiness_score);

const verificationQueue =
  synthesized
    .filter(x => x.operational_status === "VERIFICATION_REQUIRED")
    .slice(0, 150);

const outreachReady =
  synthesized.filter(x => x.operational_status === "OUTREACH_READY");

const payload = {
  version:
    "black_dragon_outreach_readiness_synthesis_v1_batch_082",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "national_outreach_readiness_synthesis_v1",

  totals: {
    synthesized_entities:
      synthesized.length,

    outreach_ready:
      outreachReady.length,

    verification_required:
      synthesized.filter(x =>
        x.operational_status === "VERIFICATION_REQUIRED"
      ).length,

    verification_queue:
      verificationQueue.length
  },

  top_verification_targets:
    verificationQueue,

  outreach_ready_targets:
    outreachReady,

  synthesized_readiness:
    synthesized
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/readiness/runtime/outreach_readiness_synthesis.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/readiness/queues/verification_priority_queue.v1.json"),
  JSON.stringify({
    version: "black_dragon_verification_priority_queue_v1_batch_082",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    verification_queue: verificationQueue
  }, null, 2)
);

console.log(JSON.stringify({
  status: "OUTREACH_READINESS_SYNTHESIS_COMPLETE",
  totals: payload.totals,
  top_verification_targets: verificationQueue.slice(0, 10).map(x => ({
    entity_id: x.entity_id,
    name: x.organization_name,
    city: x.city,
    region: x.region,
    ecosystem: x.ecosystem,
    score: x.readiness_score,
    tier: x.readiness_tier
  }))
}, null, 2));
