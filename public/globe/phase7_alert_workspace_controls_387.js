// BATCH_387_PHASE7_ALERT_WORKSPACE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_387_ALERT_CONTROLS) return;

window.__UMBRA_BATCH_387_ALERT_CONTROLS = true;

function renderAlertWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraAlertRegistry){
    window.UmbraBuildAlertRegistry?.();
  }

  const base =
    window.UmbraRenderAlertWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:387,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-alert-row").forEach(row => {

    const alertId =
      row.dataset.alertId;

    if(row.querySelector(".umbra-alert-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-alert-controls";

    controls.innerHTML = `
      <button data-alert-action="ACKNOWLEDGE">Acknowledge</button>
      <button data-alert-action="RESOLVE">Resolve</button>
      <button data-alert-action="DISMISS">Dismiss</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-alert-action="ACKNOWLEDGE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAlertState?.(
        alertId,
        "ACKNOWLEDGED",
        "Acknowledged from Alert Workspace controls."
      );
      refreshAlertRowState(row, alertId);
    };

    controls.querySelector('[data-alert-action="RESOLVE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAlertState?.(
        alertId,
        "RESOLVED",
        "Resolved from Alert Workspace controls."
      );
      refreshAlertRowState(row, alertId);
    };

    controls.querySelector('[data-alert-action="DISMISS"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateAlertState?.(
        alertId,
        "DISMISSED",
        "Dismissed from Alert Workspace controls."
      );
      refreshAlertRowState(row, alertId);
    };

    refreshAlertRowState(row, alertId);
  });

  injectAlertControlStyles();

  const report = {
    id:"PHASE_7_ALERT_WORKSPACE_CONTROLS_V1",
    batch:387,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-alert-row").length,
    control_buttons:document.querySelectorAll(".umbra-alert-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraAlertWorkspaceControls =
    report;

  return report;
}

function refreshAlertRowState(row, alertId){

  const alert =
    window.UmbraAlertRegistry?.alerts?.find(
      x => x.alert_id === alertId
    );

  if(!alert) return;

  let badge =
    row.querySelector(".umbra-alert-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-alert-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    alert.alert_status || "OPEN";
}

function injectAlertControlStyles(){

  if(document.getElementById("umbra-alert-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-alert-control-styles";

  style.textContent = `
    .umbra-alert-row{
      grid-template-columns:2fr 120px 100px 130px 140px 110px 90px 250px 120px !important;
      align-items:center;
    }

    .umbra-alert-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-alert-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-alert-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderAlertWorkspaceWithControls =
  renderAlertWorkspaceWithControls;

window.UmbraAlertWorkspaceControlsLayer = {
  id:"PHASE_7_ALERT_WORKSPACE_CONTROLS_LAYER_V1",
  batch:387,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAlertWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 387] Alert Workspace Controls active", window.UmbraAlertWorkspaceControlsLayer);

})();
