// BATCH_385_PHASE7_ALERT_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_385_ALERT_WORKSPACE) return;

window.__UMBRA_BATCH_385_ALERT_WORKSPACE = true;

function renderAlertWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraAlertRegistry){
    window.UmbraBuildAlertRegistry?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:385,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  const metrics =
    typeof window.UmbraGetAlertMetrics === "function"
      ? window.UmbraGetAlertMetrics()
      : {};

  const rows = alerts.map(alert => `
    <div class="umbra-alert-row" data-alert-id="${alert.alert_id}">
      <div>
        <div class="umbra-alert-label">${alert.alert_id}</div>
        <strong>${alert.candidate_name}</strong>
        <div class="umbra-alert-meta">${alert.candidate_id}</div>
      </div>

      <div>${alert.alert_type}</div>
      <div>${alert.severity}</div>
      <div>${alert.alert_status}</div>
      <div>${alert.source_watch_status}</div>
      <div>${alert.acknowledged ? "YES" : "NO"}</div>
      <div>${alert.resolved ? "YES" : "NO"}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 7 · ALERTS
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Alert Workspace
          </h1>

          <div style="opacity:.7;">
            Operational alert layer generated from watchlist monitoring and escalation state.
          </div>
        </div>

        <div style="
          padding:12px 18px;
          border-radius:12px;
          border:1px solid rgba(255,155,61,.24);
          background:rgba(255,155,61,.06);
          color:#ffb060;
          font-weight:700;
        ">
          ${metrics.open || 0} OPEN ALERTS
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:18px;">
        <div class="umbra-alert-metric"><span>Total</span><strong>${metrics.alert_count || 0}</strong></div>
        <div class="umbra-alert-metric"><span>Open</span><strong>${metrics.open || 0}</strong></div>
        <div class="umbra-alert-metric"><span>High</span><strong>${metrics.high_severity || 0}</strong></div>
        <div class="umbra-alert-metric"><span>Acknowledged</span><strong>${metrics.acknowledged || 0}</strong></div>
        <div class="umbra-alert-metric"><span>Resolved</span><strong>${metrics.resolved || 0}</strong></div>
      </div>

      <div class="umbra-alert-grid">
        ${rows || `<div style="opacity:.65;">No alert records available.</div>`}
      </div>

    </div>

    <style>
      .umbra-alert-metric{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-alert-metric span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-alert-metric strong{
        display:block;
        margin-top:6px;
        font-size:30px;
        color:#ffb060;
      }

      .umbra-alert-grid{
        display:grid;
        gap:10px;
      }

      .umbra-alert-row{
        display:grid;
        grid-template-columns:2fr 140px 120px 140px 160px 130px 110px;
        gap:14px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-alert-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }

      .umbra-alert-meta{
        opacity:.62;
        font-size:12px;
        margin-top:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_7_ALERT_WORKSPACE_VIEW_V1",
    batch:385,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    alert_count:alerts.length,
    open_count:metrics.open || 0,
    high_severity:metrics.high_severity || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraAlertWorkspaceView = report;
  return report;
}

window.UmbraRenderAlertWorkspace =
  renderAlertWorkspace;

window.UmbraAlertWorkspaceLayer = {
  id:"PHASE_7_ALERT_WORKSPACE_LAYER_V1",
  batch:385,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAlertWorkspace",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 385] Alert Workspace active", window.UmbraAlertWorkspaceLayer);

})();
