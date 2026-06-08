// BATCH_404_PHASE8_AUTOMATION_QUEUE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_404_AUTOMATION_QUEUE_CONTROLS) return;

window.__UMBRA_BATCH_404_AUTOMATION_QUEUE_CONTROLS = true;

function renderAutomationQueueWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  const base =
    window.UmbraRenderAutomationQueueWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:404,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-auto-row").forEach((row,index) => {

    const item =
      window.UmbraAutomationExecutionQueue?.queue?.[index];

    if(!item) return;

    row.dataset.queueId = item.queue_id;

    if(row.querySelector(".umbra-auto-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-auto-controls";

    controls.innerHTML = `
      <button data-auto-action="APPROVE">Approve</button>
      <button data-auto-action="EXECUTE">Execute</button>
      <button data-auto-action="COMPLETE">Complete</button>
      <button data-auto-action="REJECT">Reject</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-auto-action="APPROVE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutomationQueueState?.(
        item.queue_id,
        "APPROVED",
        "Approved from Automation Queue controls."
      );
      refreshAutomationQueueRowState(row, item.queue_id);
    };

    controls.querySelector('[data-auto-action="EXECUTE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutomationQueueState?.(
        item.queue_id,
        "EXECUTING",
        "Execution started from Automation Queue controls."
      );
      refreshAutomationQueueRowState(row, item.queue_id);
    };

    controls.querySelector('[data-auto-action="COMPLETE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutomationQueueState?.(
        item.queue_id,
        "COMPLETED",
        "Completed from Automation Queue controls."
      );
      refreshAutomationQueueRowState(row, item.queue_id);
    };

    controls.querySelector('[data-auto-action="REJECT"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAutomationQueueState?.(
        item.queue_id,
        "REJECTED",
        "Rejected from Automation Queue controls."
      );
      refreshAutomationQueueRowState(row, item.queue_id);
    };

    refreshAutomationQueueRowState(row, item.queue_id);

  });

  injectAutomationQueueControlStyles();

  const report = {
    id:"PHASE_8_AUTOMATION_QUEUE_CONTROLS_V1",
    batch:404,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-auto-row").length,
    control_buttons:document.querySelectorAll(".umbra-auto-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraAutomationQueueControls =
    report;

  return report;
}

function refreshAutomationQueueRowState(row, queueId){

  const item =
    window.UmbraAutomationExecutionQueue?.queue?.find(
      x => x.queue_id === queueId
    );

  if(!item) return;

  let badge =
    row.querySelector(".umbra-auto-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-auto-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    item.queue_status || "PENDING";
}

function injectAutomationQueueControlStyles(){

  if(document.getElementById("umbra-auto-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-auto-control-styles";

  style.textContent = `
    .umbra-auto-row{
      grid-template-columns:2fr 160px 120px 150px 110px 120px 280px 110px !important;
      align-items:center;
    }

    .umbra-auto-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-auto-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-auto-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderAutomationQueueWorkspaceWithControls =
  renderAutomationQueueWorkspaceWithControls;

window.UmbraAutomationQueueControlsLayer = {
  id:"PHASE_8_AUTOMATION_QUEUE_CONTROLS_LAYER_V1",
  batch:404,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutomationQueueWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 404] Automation Queue Controls active", window.UmbraAutomationQueueControlsLayer);

})();
