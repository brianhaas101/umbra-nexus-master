// BATCH_376_PHASE7_MISSION_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_376_MISSION_STATE_ENGINE) return;

window.__UMBRA_BATCH_376_MISSION_STATE_ENGINE = true;

const VALID_STATES = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED"
];

function getMission(missionId){

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  return missions.find(
    x => x.mission_id === missionId
  );
}

function updateMissionState(
  missionId,
  newState,
  note
){

  const mission =
    getMission(missionId);

  if(!mission){
    return {
      id:"PHASE_7_MISSION_STATE_UPDATE_V1",
      batch:376,
      status:"MISSION_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_7_MISSION_STATE_UPDATE_V1",
      batch:376,
      status:"INVALID_STATE"
    };
  }

  mission.state_history =
    mission.state_history || [];

  mission.state_history.push({
    from:mission.mission_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  mission.mission_status = newState;
  mission.updated_at = new Date().toISOString();

  return {
    id:"PHASE_7_MISSION_STATE_UPDATE_V1",
    batch:376,
    runtime_visible:true,
    status:"UPDATED",
    mission_id:missionId,
    new_state:newState
  };
}

function getMissionStateSummary(){

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  return {
    id:"PHASE_7_MISSION_STATE_SUMMARY_V1",
    batch:376,
    runtime_visible:true,
    open:
      missions.filter(x => x.mission_status === "OPEN").length,
    in_progress:
      missions.filter(x => x.mission_status === "IN_PROGRESS").length,
    blocked:
      missions.filter(x => x.mission_status === "BLOCKED").length,
    completed:
      missions.filter(x => x.mission_status === "COMPLETED").length,
    cancelled:
      missions.filter(x => x.mission_status === "CANCELLED").length,
    mission_count:
      missions.length
  };
}

window.UmbraUpdateMissionState =
  updateMissionState;

window.UmbraGetMissionStateSummary =
  getMissionStateSummary;

window.UmbraMissionStateEngine = {
  id:"PHASE_7_MISSION_STATE_ENGINE_V1",
  batch:376,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 376] Mission State Engine active",
  window.UmbraMissionStateEngine
);

})();
