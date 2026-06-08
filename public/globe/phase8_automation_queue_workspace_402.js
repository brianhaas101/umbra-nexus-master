// BATCH_402_PHASE8_AUTOMATION_QUEUE_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_402_QUEUE_WORKSPACE) return;

window.__UMBRA_BATCH_402_QUEUE_WORKSPACE = true;

function renderAutomationQueueWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraAutomationExecutionQueue){
    window.UmbraBuildAutomationExecutionQueue?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:402,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const queue =
    window.UmbraAutomationExecutionQueue?.queue || [];

  const metrics =
    window.UmbraGetAutomationQueueMetrics?.() || {};

  const rows = queue.map(item => `
    <div class="umbra-auto-row">
      <div>
        <div class="umbra-auto-label">${item.queue_id}</div>
        <strong>${item.candidate_id}</strong>
      </div>

      <div>${item.rule_id}</div>
      <div>${item.source_type}</div>
      <div>${item.action}</div>
      <div>${item.priority}</div>
      <div>${item.queue_status}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 8 · AUTONOMOUS OPERATIONS
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Automation Queue
          </h1>

          <div style="opacity:.7;">
            Autonomous execution candidates awaiting action.
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
          ${metrics.pending || 0} PENDING
        </div>
      </div>

      <div class="umbra-auto-metrics">
        <div class="umbra-auto-card">
          <span>Total Queue</span>
          <strong>${metrics.queue_count || 0}</strong>
        </div>

        <div class="umbra-auto-card">
          <span>High Priority</span>
          <strong>${metrics.high_priority || 0}</strong>
        </div>

        <div class="umbra-auto-card">
          <span>Normal Priority</span>
          <strong>${metrics.normal_priority || 0}</strong>
        </div>
      </div>

      <div class="umbra-auto-grid">
        ${rows}
      </div>

    </div>

    <style>
      .umbra-auto-metrics{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:14px;
        margin-bottom:18px;
      }

      .umbra-auto-card{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(
          180deg,
          rgba(12,17,30,.88),
          rgba(7,10,18,.84)
        );
      }

      .umbra-auto-card span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-auto-card strong{
        display:block;
        margin-top:8px;
        font-size:32px;
        color:#ffb060;
      }

      .umbra-auto-grid{
        display:grid;
        gap:10px;
      }

      .umbra-auto-row{
        display:grid;
        grid-template-columns:2fr 180px 140px 180px 120px 140px;
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

      .umbra-auto-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_8_AUTOMATION_QUEUE_WORKSPACE_V1",
    batch:402,
    phase:"PHASE 8",
    status:"ACTIVE",
    runtime_visible:true,
    queue_count:queue.length,
    pending:metrics.pending || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraAutomationQueueWorkspace =
    report;

  return report;
}

window.UmbraRenderAutomationQueueWorkspace =
  renderAutomationQueueWorkspace;

window.UmbraAutomationQueueWorkspaceLayer = {
  id:"PHASE_8_AUTOMATION_QUEUE_WORKSPACE_LAYER_V1",
  batch:402,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutomationQueueWorkspace",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 402] Automation Queue Workspace active",
  window.UmbraAutomationQueueWorkspaceLayer
);

})();
