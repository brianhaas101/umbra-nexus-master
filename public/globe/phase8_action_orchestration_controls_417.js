// BATCH_417_PHASE8_ACTION_ORCHESTRATION_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_417_ORCHESTRATION_CONTROLS) return;

window.__UMBRA_BATCH_417_ORCHESTRATION_CONTROLS = true;

function renderActionOrchestrationWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  const base =
    window.UmbraRenderActionOrchestrationWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:417,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-orch-row").forEach((row,index) => {

    const orchestration =
      window.UmbraActionOrchestrationRegistry?.groups?.[index];

    if(!orchestration) return;

    row.dataset.orchestrationId =
      orchestration.orchestration_id;

    if(row.querySelector(".umbra-orch-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-orch-controls";

    controls.innerHTML = `
      <button data-orch-action="EXECUTE">Execute</button>
      <button data-orch-action="PAUSE">Pause</button>
      <button data-orch-action="COMPLETE">Complete</button>
      <button data-orch-action="CANCEL">Cancel</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-orch-action="EXECUTE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateActionOrchestrationState?.(
        orchestration.orchestration_id,
        "EXECUTING",
        "Executing from orchestration controls."
      );
      refreshOrchestrationRowState(row, orchestration.orchestration_id);
    };

    controls.querySelector('[data-orch-action="PAUSE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateActionOrchestrationState?.(
        orchestration.orchestration_id,
        "PAUSED",
        "Paused from orchestration controls."
      );
      refreshOrchestrationRowState(row, orchestration.orchestration_id);
    };

    controls.querySelector('[data-orch-action="COMPLETE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateActionOrchestrationState?.(
        orchestration.orchestration_id,
        "COMPLETED",
        "Completed from orchestration controls."
      );
      refreshOrchestrationRowState(row, orchestration.orchestration_id);
    };

    controls.querySelector('[data-orch-action="CANCEL"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateActionOrchestrationState?.(
        orchestration.orchestration_id,
        "CANCELLED",
        "Cancelled from orchestration controls."
      );
      refreshOrchestrationRowState(row, orchestration.orchestration_id);
    };

    refreshOrchestrationRowState(row, orchestration.orchestration_id);
  });

  injectOrchestrationControlStyles();

  const report = {
    id:"PHASE_8_ACTION_ORCHESTRATION_CONTROLS_V1",
    batch:417,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-orch-row").length,
    control_buttons:document.querySelectorAll(".umbra-orch-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraActionOrchestrationControls = report;

  return report;
}

function refreshOrchestrationRowState(row, orchestrationId){

  const orchestration =
    window.UmbraActionOrchestrationRegistry?.groups?.find(
      x => x.orchestration_id === orchestrationId
    );

  if(!orchestration) return;

  let badge =
    row.querySelector(".umbra-orch-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-orch-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    orchestration.orchestration_status || "ACTIVE";
}

function injectOrchestrationControlStyles(){

  if(document.getElementById("umbra-orch-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-orch-control-styles";

  style.textContent = `
    .umbra-orch-row{
      grid-template-columns:2fr 120px 100px 1.4fr 280px 110px !important;
      align-items:center;
    }

    .umbra-orch-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-orch-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-orch-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderActionOrchestrationWorkspaceWithControls =
  renderActionOrchestrationWorkspaceWithControls;

window.UmbraActionOrchestrationControlsLayer = {
  id:"PHASE_8_ACTION_ORCHESTRATION_CONTROLS_LAYER_V1",
  batch:417,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderActionOrchestrationWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 417] Action Orchestration Controls active", window.UmbraActionOrchestrationControlsLayer);

})();
