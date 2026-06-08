// BATCH_377_PHASE7_MISSION_WORKSPACE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_377_MISSION_CONTROLS) return;

window.__UMBRA_BATCH_377_MISSION_CONTROLS = true;

function renderMissionWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraMissionRegistry){
    window.UmbraBuildIntelligencePresentationLayer?.();
    window.UmbraBuildMissionRegistry?.();
  }

  const base =
    window.UmbraRenderMissionWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:377,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document
    .querySelectorAll(".umbra-mission-row")
    .forEach(row => {

      const missionId =
        row.dataset.missionId;

      if(row.querySelector(".umbra-mission-controls")){
        return;
      }

      const controls =
        document.createElement("div");

      controls.className =
        "umbra-mission-controls";

      controls.innerHTML = `
        <button data-mission-action="START">Start</button>
        <button data-mission-action="BLOCK">Block</button>
        <button data-mission-action="COMPLETE">Complete</button>
        <button data-mission-action="CANCEL">Cancel</button>
      `;

      row.appendChild(controls);

      controls.querySelector('[data-mission-action="START"]').onclick = (e) => {
        e.stopPropagation();
        window.UmbraUpdateMissionState?.(
          missionId,
          "IN_PROGRESS",
          "Started from Mission Workspace controls."
        );
        refreshMissionRowState(row, missionId);
      };

      controls.querySelector('[data-mission-action="BLOCK"]').onclick = (e) => {
        e.stopPropagation();
        window.UmbraUpdateMissionState?.(
          missionId,
          "BLOCKED",
          "Blocked from Mission Workspace controls."
        );
        refreshMissionRowState(row, missionId);
      };

      controls.querySelector('[data-mission-action="COMPLETE"]').onclick = (e) => {
        e.stopPropagation();
        window.UmbraUpdateMissionState?.(
          missionId,
          "COMPLETED",
          "Completed from Mission Workspace controls."
        );
        refreshMissionRowState(row, missionId);
      };

      controls.querySelector('[data-mission-action="CANCEL"]').onclick = (e) => {
        e.stopPropagation();
        window.UmbraUpdateMissionState?.(
          missionId,
          "CANCELLED",
          "Cancelled from Mission Workspace controls."
        );
        refreshMissionRowState(row, missionId);
      };

      refreshMissionRowState(row, missionId);
    });

  injectMissionControlStyles();

  const report = {
    id:"PHASE_7_MISSION_WORKSPACE_CONTROLS_V1",
    batch:377,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-mission-row").length,
    control_buttons:document.querySelectorAll(".umbra-mission-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraMissionWorkspaceControls =
    report;

  return report;
}

function refreshMissionRowState(row, missionId){

  const mission =
    window.UmbraMissionRegistry?.missions?.find(
      x => x.mission_id === missionId
    );

  if(!mission) return;

  let badge =
    row.querySelector(".umbra-mission-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-mission-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    mission.mission_status || "OPEN";
}

function injectMissionControlStyles(){

  if(document.getElementById("umbra-mission-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-mission-control-styles";

  style.textContent = `
    .umbra-mission-row{
      grid-template-columns:2fr 110px 110px 130px 190px 280px 110px !important;
      align-items:center;
    }

    .umbra-mission-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-mission-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-mission-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderMissionWorkspaceWithControls =
  renderMissionWorkspaceWithControls;

window.UmbraMissionWorkspaceControlsLayer = {
  id:"PHASE_7_MISSION_WORKSPACE_CONTROLS_LAYER_V1",
  batch:377,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderMissionWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 377] Mission Workspace Controls active", window.UmbraMissionWorkspaceControlsLayer);

})();
