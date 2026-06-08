// BATCH_412_PHASE8_AUTONOMOUS_ACTION_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_412_ACTION_CONTROLS) return;

window.__UMBRA_BATCH_412_ACTION_CONTROLS = true;

function renderAutonomousActionWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  const base =
    window.UmbraRenderAutonomousActionWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:412,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-action-row").forEach((row,index) => {

    const action =
      window.UmbraAutonomousActionRegistry?.actions?.[index];

    if(!action) return;

    row.dataset.actionId = action.action_id;

    if(row.querySelector(".umbra-action-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-action-controls";

    controls.innerHTML = `
      <button data-action-control="APPROVE">Approve</button>
      <button data-action-control="START">Start</button>
      <button data-action-control="COMPLETE">Complete</button>
      <button data-action-control="CANCEL">Cancel</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-action-control="APPROVE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutonomousActionState?.(
        action.action_id,
        "APPROVED",
        "Approved from Autonomous Action controls."
      );
      refreshAutonomousActionRowState(row, action.action_id);
    };

    controls.querySelector('[data-action-control="START"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutonomousActionState?.(
        action.action_id,
        "IN_PROGRESS",
        "Started from Autonomous Action controls."
      );
      refreshAutonomousActionRowState(row, action.action_id);
    };

    controls.querySelector('[data-action-control="COMPLETE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutonomousActionState?.(
        action.action_id,
        "COMPLETED",
        "Completed from Autonomous Action controls."
      );
      refreshAutonomousActionRowState(row, action.action_id);
    };

    controls.querySelector('[data-action-control="CANCEL"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutonomousActionState?.(
        action.action_id,
        "CANCELLED",
        "Cancelled from Autonomous Action controls."
      );
      refreshAutonomousActionRowState(row, action.action_id);
    };

    refreshAutonomousActionRowState(row, action.action_id);
  });

  injectAutonomousActionControlStyles();

  const report = {
    id:"PHASE_8_AUTONOMOUS_ACTION_CONTROLS_V1",
    batch:412,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-action-row").length,
    control_buttons:document.querySelectorAll(".umbra-action-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraAutonomousActionControls = report;

  return report;
}

function refreshAutonomousActionRowState(row, actionId){

  const action =
    window.UmbraAutonomousActionRegistry?.actions?.find(
      x => x.action_id === actionId
    );

  if(!action) return;

  let badge =
    row.querySelector(".umbra-action-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-action-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    action.autonomous_status || "GENERATED";
}

function injectAutonomousActionControlStyles(){

  if(document.getElementById("umbra-autonomous-action-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-autonomous-action-control-styles";

  style.textContent = `
    .umbra-action-row{
      grid-template-columns:2fr 200px 120px 160px 100px 130px 280px 110px !important;
      align-items:center;
    }

    .umbra-action-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-action-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-action-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderAutonomousActionWorkspaceWithControls =
  renderAutonomousActionWorkspaceWithControls;

window.UmbraAutonomousActionControlsLayer = {
  id:"PHASE_8_AUTONOMOUS_ACTION_CONTROLS_LAYER_V1",
  batch:412,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutonomousActionWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 412] Autonomous Action Controls active", window.UmbraAutonomousActionControlsLayer);

})();
