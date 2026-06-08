// BATCH_375_PHASE7_MISSION_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_375_MISSION_WORKSPACE) return;

window.__UMBRA_BATCH_375_MISSION_WORKSPACE = true;

function renderMissionWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraMissionRegistry){
    window.UmbraBuildMissionRegistry?.();
  }

  const workspace =
    document.getElementById(
      "umbra-command-workspace"
    );

  if(!workspace){
    return {
      batch:375,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  const rows =
    missions.map(m => `
      <div
        class="umbra-mission-row"
        data-mission-id="${m.mission_id}"
      >

        <div>
          <div class="umbra-mission-label">
            ${m.mission_id}
          </div>
          <strong>
            ${m.candidate_name}
          </strong>
        </div>

        <div>
          ${m.priority}
        </div>

        <div>
          ${m.priority_score}
        </div>

        <div>
          ${m.mission_status}
        </div>

        <div>
          ${m.target_location || "-"}
        </div>

      </div>
    `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:22px;
      ">

        <div>

          <div style="
            color:#ff9b3d;
            font-size:11px;
            letter-spacing:.18em;
          ">
            PHASE 7 · MISSIONS
          </div>

          <h1 style="
            margin:4px 0;
            color:#f1f5f9;
          ">
            Mission Workspace
          </h1>

          <div style="opacity:.7;">
            Intelligence operations registry
          </div>

        </div>

        <div style="
          padding:12px 18px;
          border-radius:12px;
          border:1px solid rgba(255,155,61,.22);
          background:rgba(255,155,61,.06);
          color:#ffb060;
          font-weight:700;
        ">
          ${missions.length} MISSIONS
        </div>

      </div>

      <div class="umbra-mission-grid">

        ${rows}

      </div>

    </div>

    <style>

      .umbra-mission-grid{
        display:grid;
        gap:10px;
      }

      .umbra-mission-row{
        display:grid;
        grid-template-columns:
          2fr
          120px
          120px
          150px
          220px;

        gap:14px;

        padding:16px;

        border-radius:14px;

        border:1px solid rgba(255,155,61,.14);

        background:
          linear-gradient(
            180deg,
            rgba(12,17,30,.88),
            rgba(7,10,18,.84)
          );
      }

      .umbra-mission-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }

    </style>
  `;

  const report = {

    id:
      "PHASE_7_MISSION_WORKSPACE_VIEW_V1",

    batch:
      375,

    phase:
      "PHASE 7",

    status:
      "ACTIVE",

    runtime_visible:
      true,

    panel_id:
      "umbra-command-workspace",

    mission_count:
      missions.length,

    rendered_at:
      new Date().toISOString()

  };

  window.UmbraMissionWorkspaceView =
    report;

  return report;
}

window.UmbraRenderMissionWorkspace =
  renderMissionWorkspace;

window.UmbraMissionWorkspaceLayer = {

  id:
    "PHASE_7_MISSION_WORKSPACE_LAYER_V1",

  batch:
    375,

  phase:
    "PHASE 7",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  render_function:
    "window.UmbraRenderMissionWorkspace",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 375] Mission Workspace active",
  window.UmbraMissionWorkspaceLayer
);

})();
