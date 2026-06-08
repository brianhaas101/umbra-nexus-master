// BATCH_410_PHASE8_AUTONOMOUS_ACTION_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_410_ACTION_WORKSPACE) return;

window.__UMBRA_BATCH_410_ACTION_WORKSPACE = true;

function renderAutonomousActionWorkspace(){

  window.UmbraBuildCommandSurface?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:410,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const actions =
    window.UmbraAutonomousActionRegistry?.actions || [];

  const metrics =
    window.UmbraGetAutonomousActionMetrics?.() || {};

  const rows = actions.map(action => `
    <div class="umbra-action-row">
      <div>
        <div class="umbra-action-label">${action.action_id}</div>
        <strong>${action.candidate_id}</strong>
      </div>

      <div>${action.execution_id}</div>
      <div>${action.source_type}</div>
      <div>${action.action_type}</div>
      <div>${action.priority}</div>
      <div>${action.autonomous_status}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 8 · AUTONOMOUS ACTIONS
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Autonomous Action Workspace
          </h1>

          <div style="opacity:.7;">
            Generated autonomous actions awaiting future execution policies.
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
          ${metrics.generated || 0} GENERATED
        </div>
      </div>

      <div class="umbra-action-metrics">
        <div class="umbra-action-card">
          <span>Total Actions</span>
          <strong>${metrics.action_count || 0}</strong>
        </div>

        <div class="umbra-action-card">
          <span>High Priority</span>
          <strong>${metrics.high_priority || 0}</strong>
        </div>

        <div class="umbra-action-card">
          <span>Normal Priority</span>
          <strong>${metrics.normal_priority || 0}</strong>
        </div>
      </div>

      <div class="umbra-action-grid">
        ${rows || `<div style="opacity:.65;">No autonomous actions generated.</div>`}
      </div>

    </div>

    <style>
      .umbra-action-metrics{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:14px;
        margin-bottom:18px;
      }

      .umbra-action-card{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(
          180deg,
          rgba(12,17,30,.88),
          rgba(7,10,18,.84)
        );
      }

      .umbra-action-card span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-action-card strong{
        display:block;
        margin-top:8px;
        font-size:32px;
        color:#ffb060;
      }

      .umbra-action-grid{
        display:grid;
        gap:10px;
      }

      .umbra-action-row{
        display:grid;
        grid-template-columns:2fr 220px 140px 180px 120px 140px;
        gap:12px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:linear-gradient(
          180deg,
          rgba(12,17,30,.88),
          rgba(7,10,18,.84)
        );
      }

      .umbra-action-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_8_AUTONOMOUS_ACTION_WORKSPACE_V1",
    batch:410,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    action_count:metrics.action_count || 0,
    generated:metrics.generated || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraAutonomousActionWorkspace =
    report;

  return report;
}

window.UmbraRenderAutonomousActionWorkspace =
  renderAutonomousActionWorkspace;

window.UmbraAutonomousActionWorkspaceLayer = {
  id:"PHASE_8_AUTONOMOUS_ACTION_WORKSPACE_LAYER_V1",
  batch:410,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutonomousActionWorkspace",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 410] Autonomous Action Workspace active",
  window.UmbraAutonomousActionWorkspaceLayer
);

})();
