// BATCH_411_PHASE8_AUTONOMOUS_ACTION_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_411_ACTION_STATE_ENGINE) return;

window.__UMBRA_BATCH_411_ACTION_STATE_ENGINE = true;

const VALID_STATES = [
  "GENERATED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED"
];

function getAction(actionId){

  const actions =
    window.UmbraAutonomousActionRegistry?.actions || [];

  return actions.find(
    x => x.action_id === actionId
  );
}

function updateAutonomousActionState(
  actionId,
  newState,
  note
){

  const action =
    getAction(actionId);

  if(!action){
    return {
      id:"PHASE_8_AUTONOMOUS_ACTION_UPDATE_V1",
      batch:411,
      status:"ACTION_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_8_AUTONOMOUS_ACTION_UPDATE_V1",
      batch:411,
      status:"INVALID_STATE"
    };
  }

  action.state_history =
    action.state_history || [];

  action.state_history.push({
    from:action.autonomous_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  action.autonomous_status = newState;
  action.updated_at = new Date().toISOString();

  const report = {
    id:"PHASE_8_AUTONOMOUS_ACTION_UPDATE_V1",
    batch:411,
    phase:"PHASE 8",
    runtime_visible:true,
    status:"UPDATED",
    action_id:actionId,
    new_state:newState,
    updated_at:action.updated_at
  };

  window.UmbraLastAutonomousActionUpdate =
    report;

  return report;
}

function getAutonomousActionStateSummary(){

  const actions =
    window.UmbraAutonomousActionRegistry?.actions || [];

  return {
    id:"PHASE_8_AUTONOMOUS_ACTION_STATE_SUMMARY_V1",
    batch:411,
    phase:"PHASE 8",
    runtime_visible:true,
    generated_at:new Date().toISOString(),

    action_count:actions.length,

    generated:actions.filter(
      x => x.autonomous_status === "GENERATED"
    ).length,

    approved:actions.filter(
      x => x.autonomous_status === "APPROVED"
    ).length,

    in_progress:actions.filter(
      x => x.autonomous_status === "IN_PROGRESS"
    ).length,

    completed:actions.filter(
      x => x.autonomous_status === "COMPLETED"
    ).length,

    cancelled:actions.filter(
      x => x.autonomous_status === "CANCELLED"
    ).length
  };
}

window.UmbraUpdateAutonomousActionState =
  updateAutonomousActionState;

window.UmbraGetAutonomousActionStateSummary =
  getAutonomousActionStateSummary;

window.UmbraAutonomousActionStateEngine = {
  id:"PHASE_8_AUTONOMOUS_ACTION_STATE_ENGINE_V1",
  batch:411,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  update_function:"window.UmbraUpdateAutonomousActionState",
  summary_function:"window.UmbraGetAutonomousActionStateSummary",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 411] Autonomous Action State Engine active",
  window.UmbraAutonomousActionStateEngine
);

})();
