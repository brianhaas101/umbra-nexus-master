// BATCH_422_PHASE8_AUTONOMOUS_WORKFLOW_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_422_WORKFLOW_CONTROLS) return;

window.__UMBRA_BATCH_422_WORKFLOW_CONTROLS = true;

function renderAutonomousWorkflowWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  const base =
    window.UmbraRenderAutonomousWorkflowWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:422,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-workflow-row").forEach((row,index) => {

    const workflow =
      window.UmbraAutonomousWorkflowRegistry?.workflows?.[index];

    if(!workflow) return;

    row.dataset.workflowId =
      workflow.workflow_id;

    if(row.querySelector(".umbra-workflow-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-workflow-controls";

    controls.innerHTML = `
      <button data-workflow-action="EXECUTE">Execute</button>
      <button data-workflow-action="PAUSE">Pause</button>
      <button data-workflow-action="COMPLETE">Complete</button>
      <button data-workflow-action="CANCEL">Cancel</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-workflow-action="EXECUTE"]').onclick = () => {
      window.UmbraUpdateAutonomousWorkflowState?.(
        workflow.workflow_id,
        "EXECUTING",
        "Workflow execution initiated."
      );
      refreshWorkflowState(row, workflow.workflow_id);
    };

    controls.querySelector('[data-workflow-action="PAUSE"]').onclick = () => {
      window.UmbraUpdateAutonomousWorkflowState?.(
        workflow.workflow_id,
        "PAUSED",
        "Workflow paused."
      );
      refreshWorkflowState(row, workflow.workflow_id);
    };

    controls.querySelector('[data-workflow-action="COMPLETE"]').onclick = () => {
      window.UmbraUpdateAutonomousWorkflowState?.(
        workflow.workflow_id,
        "COMPLETED",
        "Workflow completed."
      );
      refreshWorkflowState(row, workflow.workflow_id);
    };

    controls.querySelector('[data-workflow-action="CANCEL"]').onclick = () => {
      window.UmbraUpdateAutonomousWorkflowState?.(
        workflow.workflow_id,
        "CANCELLED",
        "Workflow cancelled."
      );
      refreshWorkflowState(row, workflow.workflow_id);
    };

    refreshWorkflowState(row, workflow.workflow_id);

  });

  injectWorkflowControlStyles();

  const report = {

    id:
      "PHASE_8_AUTONOMOUS_WORKFLOW_CONTROLS_V1",

    batch:
      422,

    phase:
      "PHASE 8",

    status:
      "ACTIVE",

    runtime_visible:
      true,

    controlled_rows:
      document.querySelectorAll(".umbra-workflow-row").length,

    control_buttons:
      document.querySelectorAll(".umbra-workflow-controls button").length,

    panel_id:
      "umbra-command-workspace",

    base_result:
      base || null,

    rendered_at:
      new Date().toISOString()

  };

  window.UmbraAutonomousWorkflowControls =
    report;

  return report;
}

function refreshWorkflowState(row, workflowId){

  const workflow =
    window.UmbraAutonomousWorkflowRegistry?.workflows?.find(
      x => x.workflow_id === workflowId
    );

  if(!workflow) return;

  let badge =
    row.querySelector(".umbra-workflow-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-workflow-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    workflow.workflow_status || "ACTIVE";
}

function injectWorkflowControlStyles(){

  if(document.getElementById("umbra-workflow-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-workflow-control-styles";

  style.textContent = `
    .umbra-workflow-row{
      grid-template-columns:2fr 120px 120px 1.4fr 280px 120px !important;
      align-items:center;
    }

    .umbra-workflow-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-workflow-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-workflow-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderAutonomousWorkflowWorkspaceWithControls =
  renderAutonomousWorkflowWorkspaceWithControls;

window.UmbraAutonomousWorkflowControlsLayer = {
  id:"PHASE_8_AUTONOMOUS_WORKFLOW_CONTROLS_LAYER_V1",
  batch:422,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutonomousWorkflowWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 422] Autonomous Workflow Controls active",
  window.UmbraAutonomousWorkflowControlsLayer
);

})();
