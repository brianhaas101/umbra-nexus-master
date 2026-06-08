// BATCH_426_PHASE8_AUTONOMOUS_DIRECTIVE_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_426_DIRECTIVE_STATE_ENGINE) return;

window.__UMBRA_BATCH_426_DIRECTIVE_STATE_ENGINE = true;

const VALID_STATES = [
  "ACTIVE",
  "EXECUTING",
  "PAUSED",
  "COMPLETED",
  "CANCELLED"
];

function getDirective(directiveId){

  const directives =
    window.UmbraAutonomousDirectiveRegistry?.directives || [];

  return directives.find(
    x => x.directive_id === directiveId
  );
}

function updateAutonomousDirectiveState(
  directiveId,
  newState,
  note
){

  const directive =
    getDirective(directiveId);

  if(!directive){
    return {
      id:"PHASE_8_AUTONOMOUS_DIRECTIVE_UPDATE_V1",
      batch:426,
      status:"DIRECTIVE_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_8_AUTONOMOUS_DIRECTIVE_UPDATE_V1",
      batch:426,
      status:"INVALID_STATE"
    };
  }

  directive.state_history =
    directive.state_history || [];

  directive.state_history.push({
    from: directive.directive_status,
    to: newState,
    note: note || null,
    timestamp: new Date().toISOString()
  });

  directive.directive_status = newState;
  directive.updated_at = new Date().toISOString();

  return {
    id:"PHASE_8_AUTONOMOUS_DIRECTIVE_UPDATE_V1",
    batch:426,
    phase:"PHASE 8",
    runtime_visible:true,
    status:"UPDATED",
    directive_id:directiveId,
    new_state:newState,
    updated_at:directive.updated_at
  };
}

function getAutonomousDirectiveStateSummary(){

  const directives =
    window.UmbraAutonomousDirectiveRegistry?.directives || [];

  return {

    id:
      "PHASE_8_AUTONOMOUS_DIRECTIVE_STATE_SUMMARY_V1",

    batch:
      426,

    phase:
      "PHASE 8",

    runtime_visible:
      true,

    generated_at:
      new Date().toISOString(),

    directive_count:
      directives.length,

    active:
      directives.filter(
        x => x.directive_status === "ACTIVE"
      ).length,

    executing:
      directives.filter(
        x => x.directive_status === "EXECUTING"
      ).length,

    paused:
      directives.filter(
        x => x.directive_status === "PAUSED"
      ).length,

    completed:
      directives.filter(
        x => x.directive_status === "COMPLETED"
      ).length,

    cancelled:
      directives.filter(
        x => x.directive_status === "CANCELLED"
      ).length

  };
}

window.UmbraUpdateAutonomousDirectiveState =
  updateAutonomousDirectiveState;

window.UmbraGetAutonomousDirectiveStateSummary =
  getAutonomousDirectiveStateSummary;

window.UmbraAutonomousDirectiveStateEngine = {
  id:"PHASE_8_AUTONOMOUS_DIRECTIVE_STATE_ENGINE_V1",
  batch:426,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  update_function:"window.UmbraUpdateAutonomousDirectiveState",
  summary_function:"window.UmbraGetAutonomousDirectiveStateSummary",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 426] Autonomous Directive State Engine active",
  window.UmbraAutonomousDirectiveStateEngine
);

})();
