// BATCH_374_PHASE7_INTELLIGENCE_OPERATIONS_FOUNDATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_374_OPERATIONS_FOUNDATION) return;

window.__UMBRA_BATCH_374_OPERATIONS_FOUNDATION = true;

function buildMissionRegistry(){

  const cards =
    window.UmbraIntelligencePresentationLayer?.cards || [];

  const missions = cards.map((card,index) => {

    const missionId =
      "MISSION-" +
      String(index + 1).padStart(3,"0");

    return {

      mission_id:
        missionId,

      candidate_id:
        card.candidate_id,

      candidate_name:
        card.candidate_name,

      priority:
        card.priority || "NORMAL",

      priority_score:
        card.priority_score || 0,

      mission_type:
        "INTELLIGENCE_REVIEW",

      mission_status:
        "OPEN",

      mission_owner:
        "UMBRA_OPERATOR",

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),

      target_location:
        card.location || null,

      source_count:
        card.source_count || 0,

      action_count:
        card.action_count || 0,

      task_count:
        0,

      alert_count:
        0,

      watch_count:
        0

    };

  });

  const registry = {

    id:
      "PHASE_7_MISSION_REGISTRY_V1",

    batch:
      374,

    phase:
      "PHASE 7",

    phase_name:
      "Intelligence Operations",

    generated_at:
      new Date().toISOString(),

    runtime_visible:
      true,

    status:
      "ACTIVE",

    mission_count:
      missions.length,

    missions

  };

  window.UmbraMissionRegistry =
    registry;

  return registry;
}

function getMissionById(missionId){

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  const mission =
    missions.find(
      x => x.mission_id === missionId
    );

  return {
    id:"PHASE_7_MISSION_LOOKUP_V1",
    batch:374,
    runtime_visible:true,
    status:mission ? "FOUND" : "NOT_FOUND",
    mission
  };
}

function getMissionMetrics(){

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  return {

    id:
      "PHASE_7_MISSION_METRICS_V1",

    batch:
      374,

    runtime_visible:
      true,

    mission_count:
      missions.length,

    open:
      missions.filter(
        x => x.mission_status === "OPEN"
      ).length,

    in_progress:
      missions.filter(
        x => x.mission_status === "IN_PROGRESS"
      ).length,

    completed:
      missions.filter(
        x => x.mission_status === "COMPLETED"
      ).length

  };
}

window.UmbraBuildMissionRegistry =
  buildMissionRegistry;

window.UmbraGetMissionById =
  getMissionById;

window.UmbraGetMissionMetrics =
  getMissionMetrics;

window.UmbraIntelligenceOperationsFoundation = {

  id:
    "PHASE_7_INTELLIGENCE_OPERATIONS_FOUNDATION_V1",

  batch:
    374,

  phase:
    "PHASE 7",

  phase_name:
    "Intelligence Operations",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  registry_function:
    "window.UmbraBuildMissionRegistry",

  metrics_function:
    "window.UmbraGetMissionMetrics",

  lookup_function:
    "window.UmbraGetMissionById",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 374] Intelligence Operations Foundation active",
  window.UmbraIntelligenceOperationsFoundation
);

})();
