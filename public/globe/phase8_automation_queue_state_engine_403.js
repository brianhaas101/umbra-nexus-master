// BATCH_403_PHASE8_AUTOMATION_QUEUE_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_403_QUEUE_STATE_ENGINE) return;

window.__UMBRA_BATCH_403_QUEUE_STATE_ENGINE = true;

const VALID_STATES = [
  "PENDING",
  "APPROVED",
  "EXECUTING",
  "COMPLETED",
  "REJECTED"
];

function getQueueItem(queueId){

  const queue =
    window.UmbraAutomationExecutionQueue?.queue || [];

  return queue.find(
    x => x.queue_id === queueId
  );
}

function updateAutomationQueueState(
  queueId,
  newState,
  note
){

  const item =
    getQueueItem(queueId);

  if(!item){
    return {
      id:"PHASE_8_AUTOMATION_QUEUE_STATE_UPDATE_V1",
      batch:403,
      status:"QUEUE_ITEM_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_8_AUTOMATION_QUEUE_STATE_UPDATE_V1",
      batch:403,
      status:"INVALID_STATE"
    };
  }

  item.state_history =
    item.state_history || [];

  item.state_history.push({
    from:item.queue_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  item.queue_status = newState;
  item.updated_at = new Date().toISOString();

  const report = {
    id:"PHASE_8_AUTOMATION_QUEUE_STATE_UPDATE_V1",
    batch:403,
    phase:"PHASE 8",
    runtime_visible:true,
    status:"UPDATED",
    queue_id:queueId,
    new_state:newState,
    updated_at:item.updated_at
  };

  window.UmbraLastAutomationQueueUpdate =
    report;

  return report;
}

function getAutomationQueueStateSummary(){

  const queue =
    window.UmbraAutomationExecutionQueue?.queue || [];

  return {
    id:"PHASE_8_AUTOMATION_QUEUE_STATE_SUMMARY_V1",
    batch:403,
    phase:"PHASE 8",
    runtime_visible:true,
    generated_at:new Date().toISOString(),
    queue_count:queue.length,
    pending:queue.filter(x => x.queue_status === "PENDING").length,
    approved:queue.filter(x => x.queue_status === "APPROVED").length,
    executing:queue.filter(x => x.queue_status === "EXECUTING").length,
    completed:queue.filter(x => x.queue_status === "COMPLETED").length,
    rejected:queue.filter(x => x.queue_status === "REJECTED").length
  };
}

window.UmbraUpdateAutomationQueueState =
  updateAutomationQueueState;

window.UmbraGetAutomationQueueStateSummary =
  getAutomationQueueStateSummary;

window.UmbraAutomationQueueStateEngine = {
  id:"PHASE_8_AUTOMATION_QUEUE_STATE_ENGINE_V1",
  batch:403,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  update_function:"window.UmbraUpdateAutomationQueueState",
  summary_function:"window.UmbraGetAutomationQueueStateSummary",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 403] Automation Queue State Engine active",
  window.UmbraAutomationQueueStateEngine
);

})();
