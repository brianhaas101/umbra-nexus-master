// BATCH_389_PHASE7_TASKING_FOUNDATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_389_TASKING_FOUNDATION) return;

window.__UMBRA_BATCH_389_TASKING_FOUNDATION = true;

function buildTaskRegistry(){

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  const tasks = alerts.map((alert,index) => {

    return {

      task_id:
        "TASK-" +
        String(index + 1).padStart(3,"0"),

      alert_id:
        alert.alert_id,

      watch_id:
        alert.watch_id,

      candidate_id:
        alert.candidate_id,

      candidate_name:
        alert.candidate_name,

      task_type:
        alert.severity === "HIGH"
          ? "INVESTIGATION"
          : "MONITORING",

      priority:
        alert.severity === "HIGH"
          ? "HIGH"
          : "NORMAL",

      task_status:
        "OPEN",

      assigned_to:
        null,

      created_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),

      completion_notes:
        null

    };

  });

  const registry = {

    id:
      "PHASE_7_TASK_REGISTRY_V1",

    batch:
      389,

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

    task_count:
      tasks.length,

    tasks

  };

  window.UmbraTaskRegistry =
    registry;

  return registry;
}

function getTaskMetrics(){

  const tasks =
    window.UmbraTaskRegistry?.tasks || [];

  return {

    id:
      "PHASE_7_TASK_METRICS_V1",

    batch:
      389,

    runtime_visible:
      true,

    task_count:
      tasks.length,

    open:
      tasks.filter(
        x => x.task_status === "OPEN"
      ).length,

    in_progress:
      tasks.filter(
        x => x.task_status === "IN_PROGRESS"
      ).length,

    completed:
      tasks.filter(
        x => x.task_status === "COMPLETED"
      ).length,

    cancelled:
      tasks.filter(
        x => x.task_status === "CANCELLED"
      ).length,

    high_priority:
      tasks.filter(
        x => x.priority === "HIGH"
      ).length

  };
}

function getTaskById(taskId){

  const task =
    (window.UmbraTaskRegistry?.tasks || [])
      .find(x => x.task_id === taskId);

  return {

    id:
      "PHASE_7_TASK_LOOKUP_V1",

    batch:
      389,

    runtime_visible:
      true,

    status:
      task ? "FOUND" : "NOT_FOUND",

    task

  };
}

window.UmbraBuildTaskRegistry =
  buildTaskRegistry;

window.UmbraGetTaskMetrics =
  getTaskMetrics;

window.UmbraGetTaskById =
  getTaskById;

window.UmbraTaskingFoundation = {

  id:
    "PHASE_7_TASKING_FOUNDATION_V1",

  batch:
    389,

  phase:
    "PHASE 7",

  phase_name:
    "Intelligence Operations",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  registry_function:
    "window.UmbraBuildTaskRegistry",

  metrics_function:
    "window.UmbraGetTaskMetrics",

  lookup_function:
    "window.UmbraGetTaskById",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 389] Tasking Foundation active",
  window.UmbraTaskingFoundation
);

})();
