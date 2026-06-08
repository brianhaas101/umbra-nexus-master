// BATCH_415_PHASE8_ACTION_ORCHESTRATION_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_415_ORCHESTRATION_WORKSPACE) return;

window.__UMBRA_BATCH_415_ORCHESTRATION_WORKSPACE = true;

function renderActionOrchestrationWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraActionOrchestrationRegistry){
    window.UmbraBuildActionOrchestrationRegistry?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:415,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const groups =
    window.UmbraActionOrchestrationRegistry?.groups || [];

  const metrics =
    window.UmbraGetActionOrchestrationMetrics?.() || {};

  const rows = groups.map(group => `
    <div class="umbra-orch-row" data-orchestration-id="${group.orchestration_id}">
      <div>
        <div class="umbra-orch-label">${group.orchestration_id}</div>
        <strong>${group.orchestration_name}</strong>
      </div>

      <div>${group.orchestration_status}</div>
      <div>${group.action_count}</div>
      <div>${group.action_ids.join(", ")}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 8 · ACTION ORCHESTRATION
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Action Orchestration Workspace
          </h1>

          <div style="opacity:.7;">
            Multi-action autonomous workflow coordination layer.
          </div>
        </div>

        <div style="
          padding:12px 18px;
          border-radius:12px;
          border:1px solid rgba(56,232,138,.24);
          background:rgba(56,232,138,.06);
          color:#38e88a;
          font-weight:700;
        ">
          ${metrics.active || 0} ACTIVE
        </div>
      </div>

      <div class="umbra-orch-metrics">
        <div class="umbra-orch-card">
          <span>Orchestrations</span>
          <strong>${metrics.orchestration_count || 0}</strong>
        </div>

        <div class="umbra-orch-card">
          <span>Total Actions</span>
          <strong>${metrics.total_actions || 0}</strong>
        </div>
      </div>

      <div class="umbra-orch-grid">
        ${rows || `<div style="opacity:.65;">No orchestration groups available.</div>`}
      </div>
    </div>

    <style>
      .umbra-orch-metrics{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:14px;
        margin-bottom:18px;
      }

      .umbra-orch-card{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-orch-card span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-orch-card strong{
        display:block;
        margin-top:8px;
        font-size:32px;
        color:#ffb060;
      }

      .umbra-orch-grid{
        display:grid;
        gap:10px;
      }

      .umbra-orch-row{
        display:grid;
        grid-template-columns:2fr 160px 130px 1.8fr;
        gap:14px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-orch-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_8_ACTION_ORCHESTRATION_WORKSPACE_V1",
    batch:415,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    orchestration_count:metrics.orchestration_count || 0,
    total_actions:metrics.total_actions || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraActionOrchestrationWorkspace = report;

  return report;
}

window.UmbraRenderActionOrchestrationWorkspace =
  renderActionOrchestrationWorkspace;

window.UmbraActionOrchestrationWorkspaceLayer = {
  id:"PHASE_8_ACTION_ORCHESTRATION_WORKSPACE_LAYER_V1",
  batch:415,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderActionOrchestrationWorkspace",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 415] Action Orchestration Workspace active", window.UmbraActionOrchestrationWorkspaceLayer);

})();
