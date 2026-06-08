// BATCH_416_PHASE8_ACTION_ORCHESTRATION_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_416_ORCHESTRATION_STATE_ENGINE) return;

window.__UMBRA_BATCH_416_ORCHESTRATION_STATE_ENGINE = true;

const VALID_STATES = [
  "ACTIVE",
  "PAUSED",
  "EXECUTING",
  "COMPLETED",
  "CANCELLED"
];

function getOrchestration(orchestrationId){

  const groups =
    window.UmbraActionOrchestrationRegistry?.groups || [];

  return groups.find(
    x => x.orchestration_id === orchestrationId
  );
}

function updateActionOrchestrationState(
  orchestrationId,
  newState,
  note
){

  const orchestration =
    getOrchestration(orchestrationId);

  if(!orchestration){
    return {
      id:"PHASE_8_ACTION_ORCHESTRATION_UPDATE_V1",
      batch:416,
      status:"ORCHESTRATION_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_8_ACTION_ORCHESTRATION_UPDATE_V1",
      batch:416,
      status:"INVALID_STATE"
    };
  }

  orchestration.state_history =
    orchestration.state_history || [];

  orchestration.state_history.push({
    from:orchestration.orchestration_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  orchestration.orchestration_status =
    newState;

  orchestration.updated_at =
    new Date().toISOString();

  const report = {
    id:"PHASE_8_ACTION_ORCHESTRATION_UPDATE_V1",
    batch:416,
    phase:"PHASE 8",
    runtime_visible:true,
    status:"UPDATED",
    orchestration_id:orchestrationId,
    new_state:newState,
    updated_at:orchestration.updated_at
  };

  window.UmbraLastOrchestrationUpdate =
    report;

  return report;
}

function getActionOrchestrationStateSummary(){

  const groups =
    window.UmbraActionOrchestrationRegistry?.groups || [];

  return {
    id:"PHASE_8_ACTION_ORCHESTRATION_STATE_SUMMARY_V1",
    batch:416,
    phase:"PHASE 8",
    runtime_visible:true,
    generated_at:new Date().toISOString(),

    orchestration_count:groups.length,

    active:groups.filter(
      x => x.orchestration_status === "ACTIVE"
    ).length,

    paused:groups.filter(
      x => x.orchestration_status === "PAUSED"
    ).length,

    executing:groups.filter(
      x => x.orchestration_status === "EXECUTING"
    ).length,

    completed:groups.filter(
      x => x.orchestration_status === "COMPLETED"
    ).length,

    cancelled:groups.filter(
      x => x.orchestration_status === "CANCELLED"
    ).length
  };
}

window.UmbraUpdateActionOrchestrationState =
  updateActionOrchestrationState;

window.UmbraGetActionOrchestrationStateSummary =
  getActionOrchestrationStateSummary;

window.UmbraActionOrchestrationStateEngine = {
  id:"PHASE_8_ACTION_ORCHESTRATION_STATE_ENGINE_V1",
  batch:416,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  update_function:"window.UmbraUpdateActionOrchestrationState",
  summary_function:"window.UmbraGetActionOrchestrationStateSummary",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 416] Action Orchestration State Engine active",
  window.UmbraActionOrchestrationStateEngine
);

})();
