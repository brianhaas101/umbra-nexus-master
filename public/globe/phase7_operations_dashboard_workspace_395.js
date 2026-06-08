// BATCH_395_PHASE7_OPERATIONS_DASHBOARD_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_395_OPS_DASHBOARD_WORKSPACE) return;

window.__UMBRA_BATCH_395_OPS_DASHBOARD_WORKSPACE = true;

function renderOperationsDashboardWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraOperationsDashboard){
    window.UmbraBuildOperationsDashboard?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:395,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const dashboard =
    window.UmbraOperationsDashboard || {};

  const metrics =
    window.UmbraGetOperationsDashboardMetrics?.() || {};

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 7 · OPERATIONS
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Operations Dashboard
          </h1>

          <div style="opacity:.7;">
            Unified intelligence operations command layer across missions, watchlists, alerts, and tasks.
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
          ACTIVE OPS
        </div>
      </div>

      <div class="umbra-ops-metrics">
        <div class="umbra-ops-card"><span>Missions</span><strong>${metrics.mission_count || 0}</strong></div>
        <div class="umbra-ops-card"><span>Watchlists</span><strong>${metrics.watch_count || 0}</strong></div>
        <div class="umbra-ops-card"><span>Alerts</span><strong>${metrics.alert_count || 0}</strong></div>
        <div class="umbra-ops-card"><span>Tasks</span><strong>${metrics.task_count || 0}</strong></div>
      </div>

      <div class="umbra-ops-grid">

        <div class="umbra-ops-panel">
          <div class="umbra-ops-panel-title">Mission State</div>
          <div class="umbra-ops-line"><span>Open</span><strong>${dashboard.mission_metrics?.open || 0}</strong></div>
          <div class="umbra-ops-line"><span>In Progress</span><strong>${dashboard.mission_metrics?.in_progress || 0}</strong></div>
          <div class="umbra-ops-line"><span>Completed</span><strong>${dashboard.mission_metrics?.completed || 0}</strong></div>
        </div>

        <div class="umbra-ops-panel">
          <div class="umbra-ops-panel-title">Watchlist State</div>
          <div class="umbra-ops-line"><span>Active</span><strong>${dashboard.watchlist_metrics?.active || 0}</strong></div>
          <div class="umbra-ops-line"><span>Escalated</span><strong>${dashboard.watchlist_metrics?.escalated || 0}</strong></div>
          <div class="umbra-ops-line"><span>Closed</span><strong>${dashboard.watchlist_metrics?.closed || 0}</strong></div>
        </div>

        <div class="umbra-ops-panel">
          <div class="umbra-ops-panel-title">Alert State</div>
          <div class="umbra-ops-line"><span>Open</span><strong>${dashboard.alert_metrics?.open || 0}</strong></div>
          <div class="umbra-ops-line"><span>Acknowledged</span><strong>${dashboard.alert_metrics?.acknowledged || 0}</strong></div>
          <div class="umbra-ops-line"><span>Resolved</span><strong>${dashboard.alert_metrics?.resolved || 0}</strong></div>
        </div>

        <div class="umbra-ops-panel">
          <div class="umbra-ops-panel-title">Task State</div>
          <div class="umbra-ops-line"><span>Open</span><strong>${dashboard.task_metrics?.open || 0}</strong></div>
          <div class="umbra-ops-line"><span>In Progress</span><strong>${dashboard.task_metrics?.in_progress || 0}</strong></div>
          <div class="umbra-ops-line"><span>Completed</span><strong>${dashboard.task_metrics?.completed || 0}</strong></div>
        </div>

      </div>
    </div>

    <style>
      .umbra-ops-metrics{
        display:grid;
        grid-template-columns:repeat(4,1fr);
        gap:14px;
        margin-bottom:18px;
      }

      .umbra-ops-card,
      .umbra-ops-panel{
        border:1px solid rgba(255,155,61,.14);
        border-radius:18px;
        padding:18px;
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-ops-card span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-ops-card strong{
        display:block;
        margin-top:8px;
        font-size:36px;
        color:#ffb060;
      }

      .umbra-ops-grid{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:16px;
      }

      .umbra-ops-panel-title{
        color:#ff9b3d;
        font-size:12px;
        letter-spacing:.14em;
        margin-bottom:12px;
        font-weight:800;
      }

      .umbra-ops-line{
        display:flex;
        justify-content:space-between;
        padding:10px 0;
        border-bottom:1px solid rgba(255,255,255,.06);
      }

      .umbra-ops-line span{
        opacity:.72;
      }

      .umbra-ops-line strong{
        color:#38e88a;
      }
    </style>
  `;

  const report = {
    id:"PHASE_7_OPERATIONS_DASHBOARD_WORKSPACE_V1",
    batch:395,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    panel_id:"umbra-command-workspace",
    mission_count:metrics.mission_count || 0,
    watch_count:metrics.watch_count || 0,
    alert_count:metrics.alert_count || 0,
    task_count:metrics.task_count || 0,
    rendered_at:new Date().toISOString()
  };

  window.UmbraOperationsDashboardWorkspace = report;

  return report;
}

window.UmbraRenderOperationsDashboardWorkspace =
  renderOperationsDashboardWorkspace;

window.UmbraOperationsDashboardWorkspaceLayer = {
  id:"PHASE_7_OPERATIONS_DASHBOARD_WORKSPACE_LAYER_V1",
  batch:395,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderOperationsDashboardWorkspace",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 395] Operations Dashboard Workspace active", window.UmbraOperationsDashboardWorkspaceLayer);

})();
