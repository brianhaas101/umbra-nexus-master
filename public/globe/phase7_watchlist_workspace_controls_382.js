// BATCH_382_PHASE7_WATCHLIST_WORKSPACE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_382_WATCHLIST_CONTROLS) return;

window.__UMBRA_BATCH_382_WATCHLIST_CONTROLS = true;

function renderWatchlistWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraWatchlistRegistry){
    window.UmbraBuildIntelligencePresentationLayer?.();
    window.UmbraBuildMissionRegistry?.();
    window.UmbraBuildWatchlistRegistry?.();
  }

  const base =
    window.UmbraRenderWatchlistWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:382,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document.querySelectorAll(".umbra-watch-row").forEach(row => {

    const watchId =
      row.dataset.watchId;

    if(row.querySelector(".umbra-watch-controls")){
      return;
    }

    const controls =
      document.createElement("div");

    controls.className =
      "umbra-watch-controls";

    controls.innerHTML = `
      <button data-watch-action="ESCALATE">Escalate</button>
      <button data-watch-action="PAUSE">Pause</button>
      <button data-watch-action="ACTIVE">Activate</button>
      <button data-watch-action="CLOSE">Close</button>
    `;

    row.appendChild(controls);

    controls.querySelector('[data-watch-action="ESCALATE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateWatchState?.(
        watchId,
        "ESCALATED",
        "Escalated from Watchlist Workspace controls."
      );
      refreshWatchRowState(row, watchId);
    };

    controls.querySelector('[data-watch-action="PAUSE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateWatchState?.(
        watchId,
        "PAUSED",
        "Paused from Watchlist Workspace controls."
      );
      refreshWatchRowState(row, watchId);
    };

    controls.querySelector('[data-watch-action="ACTIVE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateWatchState?.(
        watchId,
        "ACTIVE",
        "Activated from Watchlist Workspace controls."
      );
      refreshWatchRowState(row, watchId);
    };

    controls.querySelector('[data-watch-action="CLOSE"]').onclick = (e) => {
      e.stopPropagation();
      window.UmbraUpdateWatchState?.(
        watchId,
        "CLOSED",
        "Closed from Watchlist Workspace controls."
      );
      refreshWatchRowState(row, watchId);
    };

    refreshWatchRowState(row, watchId);
  });

  injectWatchControlStyles();

  const report = {
    id:"PHASE_7_WATCHLIST_WORKSPACE_CONTROLS_V1",
    batch:382,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    controlled_rows:document.querySelectorAll(".umbra-watch-row").length,
    control_buttons:document.querySelectorAll(".umbra-watch-controls button").length,
    panel_id:"umbra-command-workspace",
    base_result:base || null,
    rendered_at:new Date().toISOString()
  };

  window.UmbraWatchlistWorkspaceControls =
    report;

  return report;
}

function refreshWatchRowState(row, watchId){

  const watch =
    window.UmbraWatchlistRegistry?.watchlists?.find(
      x => x.watch_id === watchId
    );

  if(!watch) return;

  let badge =
    row.querySelector(".umbra-watch-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-watch-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    watch.watch_status || "ACTIVE";
}

function injectWatchControlStyles(){

  if(document.getElementById("umbra-watch-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-watch-control-styles";

  style.textContent = `
    .umbra-watch-row{
      grid-template-columns:2fr 110px 100px 100px 120px 80px 80px 270px 110px !important;
      align-items:center;
    }

    .umbra-watch-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-watch-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-watch-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderWatchlistWorkspaceWithControls =
  renderWatchlistWorkspaceWithControls;

window.UmbraWatchlistWorkspaceControlsLayer = {
  id:"PHASE_7_WATCHLIST_WORKSPACE_CONTROLS_LAYER_V1",
  batch:382,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderWatchlistWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 382] Watchlist Workspace Controls active", window.UmbraWatchlistWorkspaceControlsLayer);

})();
