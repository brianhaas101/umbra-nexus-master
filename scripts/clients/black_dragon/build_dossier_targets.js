const fs = require("fs");
const path = require("path");

const IN_PATH = "public/data/clients/black_dragon/normalized_intelligence_outputs.json";
const OUT_PATH = "public/data/clients/black_dragon/dossier_targets.json";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function groupByEntity(items) {
  const map = {};
  for (const item of items || []) {
    if (!map[item.entity_id]) map[item.entity_id] = [];
    map[item.entity_id].push(item);
  }
  return map;
}

function main() {
  const input = readJson(IN_PATH);

  const evidenceByEntity = groupByEntity(input.evidence);
  const signalsByEntity = groupByEntity(input.signals);
  const scoresByEntity = groupByEntity(input.score_components);
  const fieldsByEntity = groupByEntity(input.dossier_fields);

  const dossiers = input.entities.map(entity => {
    const scores = scoresByEntity[entity.entity_id] || [];
    const weightedTotal = scores.reduce((sum, s) => sum + (s.component_score * s.weight), 0);
    const weightTotal = scores.reduce((sum, s) => sum + s.weight, 0);
    const finalScore = weightTotal ? Math.round(weightedTotal / weightTotal) : 0;

    return {
      entity_id: entity.entity_id,
      agency_name: entity.agency_name,
      city: entity.city,
      state: entity.state,
      country: entity.country,
      entity_type: entity.entity_type,

      dossier_status: "READY_FOR_CLIENT_REVIEW",

      intelligence_summary: {
        final_score: finalScore,
        confidence: entity.confidence,
        primary_relevance:
          "Verified law-enforcement training or command contact path for Black Dragon outreach.",
        source_count: entity.source_trace.length
      },

      agency_identity: {
        agency_name: entity.agency_name,
        jurisdiction: `${entity.city || "Unknown"}, ${entity.state}`,
        source_trace: entity.source_trace
      },

      contact_path: {
        primary_phone:
          (fieldsByEntity[entity.entity_id] || []).find(f => f.field_name === "primary_phone")?.value || "",
        recommended_route:
          (signalsByEntity[entity.entity_id] || [])[0]?.signal_value || "",
        status: "READY_TO_CALL"
      },

      training_relevance: {
        route:
          (fieldsByEntity[entity.entity_id] || []).find(f => f.field_name === "training_or_command_route")?.value || "",
        relevance_reason:
          "Training, command, academy, professional standards, or department routing path identified.",
        black_dragon_fit:
          "Potential fit for officer-safety and motorcycle-club encounter training."
      },

      evidence: evidenceByEntity[entity.entity_id] || [],
      signals: signalsByEntity[entity.entity_id] || [],
      score_components: scores,
      notes: ""
    };
  });

  const output = {
    version: "black_dragon_dossier_targets_v1",
    generated_at: new Date().toISOString(),
    source: IN_PATH,
    total_dossiers: dossiers.length,
    rule: "Dossiers are generated only from normalized verified intelligence outputs.",
    dossiers
  };

  writeJson(OUT_PATH, output);

  console.log("[DOSSIER] COMPLETE");
  console.log("[DOSSIER] Dossiers:", dossiers.length);
  console.log("[DOSSIER] Output:", OUT_PATH);
}

main();
