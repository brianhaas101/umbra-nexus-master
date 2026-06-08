// BATCH_392_PHASE7_TASK_WORKSPACE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_392_TASK_CONTROLS) return;

window.__UMBRA_BATCH_392_TASK_CONTROLS = true;

function renderTaskWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraTaskRegistry){
    window.UmbraBuildTaskRegistry?.();
  }

  const base =
    window.UmbraRenderTaskWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:392,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-task-row").forEach(row => {

    const taskId =
      row.dataset.taskId;

    if(row.querySelector(".umbra-task-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-task-controls";

    controls.innerHTML = `
      <button data-task-action="START">Start</button>
      <button data-task-action="BLOCK">Block</button>
      <button data-task-action="COMPLETE">Complete</button>
      <button data-task-action="CANCEL">Cancel</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-task-action="START"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateTaskState?.(
        taskId,
        "IN_PROGRESS",
        "Started from Task Workspace controls."
      );
      refreshTaskRowState(row, taskId);
    };

    controls.querySelector('[data-task-action="BLOCK"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateTaskState?.(
        taskId,
        "BLOCKED",
        "Blocked from Task Workspace controls."
      );
      refreshTaskRowState(row, taskId);
    };

    controls.querySelector('[data-task-action="COMPLETE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateTaskState?.(
        taskId,
        "COMPLETED",
        "Completed from Task Workspace controls."
      );
      refreshTaskRowState(row, taskId);
    };

    controls.querySelector('[data-task-action="CANCEL"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateTaskState?.(
        taskId,
        "CANCELLED",
        "Cancelled from Task Workspace controls."
      );
      refreshTaskRowState(row, taskId);
    };

    refreshTaskRowState(row, taskId);
  });

  injectTaskControlStyles();

  const report = {
    id:"PHASE_7_TASK_WORKSPACE_CONTROLS_V1",
    batch:392,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-task-row").length,
    control_buttons:document.querySelectorAll(".umbra-task-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraTaskWorkspaceControls =
    report;

  return report;
}

function refreshTaskRowState(row, taskId){

  const task =
    window.UmbraTaskRegistry?.tasks?.find(
      x => x.task_id === taskId
    );

  if(!task) return;

  let badge =
    row.querySelector(".umbra-task-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-task-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    task.task_status || "OPEN";
}

function injectTaskControlStyles(){

  if(document.getElementById("umbra-task-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-task-control-styles";

  style.textContent = `
    .umbra-task-row{
      grid-template-columns:2fr 120px 100px 120px 120px 150px 270px 110px !important;
      align-items:center;
    }

    .umbra-task-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-task-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-task-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderTaskWorkspaceWithControls =
  renderTaskWorkspaceWithControls;

window.UmbraTaskWorkspaceControlsLayer = {
  id:"PHASE_7_TASK_WORKSPACE_CONTROLS_LAYER_V1",
  batch:392,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderTaskWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 392] Task Workspace Controls active", window.UmbraTaskWorkspaceControlsLayer);

})();
