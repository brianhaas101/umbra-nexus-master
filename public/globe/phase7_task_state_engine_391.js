// BATCH_391_PHASE7_TASK_STATE_ENGINE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_391_TASK_STATE_ENGINE) return;

window.__UMBRA_BATCH_391_TASK_STATE_ENGINE = true;

const VALID_STATES = [
  "OPEN",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED"
];

function getTask(taskId){

  const tasks =
    window.UmbraTaskRegistry?.tasks || [];

  return tasks.find(
    x => x.task_id === taskId
  );
}

function updateTaskState(taskId, newState, note){

  const task =
    getTask(taskId);

  if(!task){
    return {
      id:"PHASE_7_TASK_STATE_UPDATE_V1",
      batch:391,
      status:"TASK_NOT_FOUND"
    };
  }

  if(!VALID_STATES.includes(newState)){
    return {
      id:"PHASE_7_TASK_STATE_UPDATE_V1",
      batch:391,
      status:"INVALID_STATE"
    };
  }

  task.state_history =
    task.state_history || [];

  task.state_history.push({
    from:task.task_status,
    to:newState,
    note:note || null,
    timestamp:new Date().toISOString()
  });

  task.task_status = newState;
  task.updated_at = new Date().toISOString();

  if(newState === "COMPLETED"){
    task.completion_notes =
      note || "Completed.";
  }

  const report = {
    id:"PHASE_7_TASK_STATE_UPDATE_V1",
    batch:391,
    phase:"PHASE 7",
    runtime_visible:true,
    status:"UPDATED",
    task_id:taskId,
    new_state:newState,
    updated_at:task.updated_at
  };

  window.UmbraLastTaskStateUpdate = report;

  return report;
}

function getTaskStateSummary(){

  const tasks =
    window.UmbraTaskRegistry?.tasks || [];

  return {
    id:"PHASE_7_TASK_STATE_SUMMARY_V1",
    batch:391,
    phase:"PHASE 7",
    runtime_visible:true,
    generated_at:new Date().toISOString(),
    task_count:tasks.length,
    open:tasks.filter(x => x.task_status === "OPEN").length,
    in_progress:tasks.filter(x => x.task_status === "IN_PROGRESS").length,
    blocked:tasks.filter(x => x.task_status === "BLOCKED").length,
    completed:tasks.filter(x => x.task_status === "COMPLETED").length,
    cancelled:tasks.filter(x => x.task_status === "CANCELLED").length
  };
}

window.UmbraUpdateTaskState =
  updateTaskState;

window.UmbraGetTaskStateSummary =
  getTaskStateSummary;

window.UmbraTaskStateEngine = {
  id:"PHASE_7_TASK_STATE_ENGINE_V1",
  batch:391,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  valid_states:VALID_STATES,
  update_function:"window.UmbraUpdateTaskState",
  summary_function:"window.UmbraGetTaskStateSummary",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 391] Task State Engine active", window.UmbraTaskStateEngine);

})();
