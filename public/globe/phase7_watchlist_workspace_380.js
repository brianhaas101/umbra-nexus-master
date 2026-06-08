// BATCH_380_PHASE7_WATCHLIST_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_380_WATCHLIST_WORKSPACE) return;

window.__UMBRA_BATCH_380_WATCHLIST_WORKSPACE = true;

function renderWatchlistWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraWatchlistRegistry){
    window.UmbraBuildIntelligencePresentationLayer?.();
    window.UmbraBuildMissionRegistry?.();
    window.UmbraBuildWatchlistRegistry?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:380,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  const metrics =
    typeof window.UmbraGetWatchlistMetrics === "function"
      ? window.UmbraGetWatchlistMetrics()
      : {};

  const rows = watchlists.map(watch => `
    <div class="umbra-watch-row" data-watch-id="${watch.watch_id}">
      <div>
        <div class="umbra-watch-label">${watch.watch_id}</div>
        <strong>${watch.candidate_name}</strong>
        <div class="umbra-watch-meta">${watch.candidate_id}</div>
      </div>

      <div>${watch.watch_type}</div>
      <div>${watch.priority}</div>
      <div>${watch.priority_score}</div>
      <div>${watch.watch_status}</div>
      <div>${watch.alert_count || 0}</div>
      <div>${watch.event_count || 0}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 7 · WATCHLISTS
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Watchlist Workspace
          </h1>

          <div style="opacity:.7;">
            Continuous monitoring layer for candidates, missions, and operational intelligence.
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
          ${metrics.active || 0} ACTIVE WATCHES
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;">
        <div class="umbra-watch-metric"><span>Total</span><strong>${metrics.watch_count || 0}</strong></div>
        <div class="umbra-watch-metric"><span>Active</span><strong>${metrics.active || 0}</strong></div>
        <div class="umbra-watch-metric"><span>Escalated</span><strong>${metrics.escalated || 0}</strong></div>
        <div class="umbra-watch-metric"><span>Closed</span><strong>${metrics.closed || 0}</strong></div>
      </div>

      <div class="umbra-watch-grid">
        ${rows || `<div style="opacity:.65;">No watchlist records available.</div>`}
      </div>

    </div>

    <style>
      .umbra-watch-metric{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-watch-metric span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-watch-metric strong{
        display:block;
        margin-top:6px;
        font-size:30px;
        color:#ffb060;
      }

      .umbra-watch-grid{
        display:grid;
        gap:10px;
      }

      .umbra-watch-row{
        display:grid;
        grid-template-columns:2fr 130px 120px 120px 140px 100px 100px;
        gap:14px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-watch-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }

      .umbra-watch-meta{
        opacity:.62;
        font-size:12px;
        margin-top:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_7_WATCHLIST_WORKSPACE_VIEW_V1",
    batch:380,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    watch_count:watchlists.length,
    active_count:metrics.active || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraWatchlistWorkspaceView = report;
  return report;
}

window.UmbraRenderWatchlistWorkspace =
  renderWatchlistWorkspace;

window.UmbraWatchlistWorkspaceLayer = {
  id:"PHASE_7_WATCHLIST_WORKSPACE_LAYER_V1",
  batch:380,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderWatchlistWorkspace",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 380] Watchlist Workspace active", window.UmbraWatchlistWorkspaceLayer);

})();
