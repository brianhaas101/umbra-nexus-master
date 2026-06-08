// BATCH_383_PHASE7_WATCHLIST_CONTROL_CERTIFICATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_383_WATCHLIST_CERT) return;

window.__UMBRA_BATCH_383_WATCHLIST_CERT = true;

function certifyWatchlistControl(){

  window.UmbraBuildIntelligencePresentationLayer?.();
  window.UmbraBuildMissionRegistry?.();
  window.UmbraBuildWatchlistRegistry?.();
  window.UmbraRenderWatchlistWorkspaceWithControls?.();

  const watchlists =
    window.UmbraWatchlistRegistry?.watchlists || [];

  const first =
    watchlists[0] || null;

  let stateResult = null;

  if(first && typeof window.UmbraUpdateWatchState === "function"){

    stateResult =
      window.UmbraUpdateWatchState(
        first.watch_id,
        "ESCALATED",
        "Batch 383 certification test."
      );

  }

  const summary =
    typeof window.UmbraGetWatchlistStateSummary === "function"
      ? window.UmbraGetWatchlistStateSummary()
      : null;

  const checks = [

    {
      id:"WATCHLIST_REGISTRY_EXISTS",
      pass:watchlists.length >= 20
    },

    {
      id:"WATCHLIST_WORKSPACE_ACTIVE",
      pass:
        window.UmbraWatchlistWorkspaceView?.status === "ACTIVE"
    },

    {
      id:"WATCHLIST_CONTROLS_ACTIVE",
      pass:
        window.UmbraWatchlistWorkspaceControls?.status === "ACTIVE"
    },

    {
      id:"WATCHLIST_STATE_ENGINE_ACTIVE",
      pass:
        window.UmbraWatchlistStateEngine?.status === "ACTIVE"
    },

    {
      id:"CONTROL_ROWS_PRESENT",
      pass:
        (window.UmbraWatchlistWorkspaceControls?.controlled_rows || 0) >= 20
    },

    {
      id:"CONTROL_BUTTONS_PRESENT",
      pass:
        (window.UmbraWatchlistWorkspaceControls?.control_buttons || 0) >= 80
    },

    {
      id:"STATE_UPDATE_WORKING",
      pass:
        stateResult?.status === "UPDATED"
    },

    {
      id:"STATE_SUMMARY_WORKING",
      pass:
        summary?.watch_count >= 20 &&
        summary?.escalated >= 1
    }

  ];

  const pass =
    checks.filter(x => x.pass).length;

  const fail =
    checks.filter(x => !x.pass).length;

  const certified =
    fail === 0;

  const report = {

    id:
      "PHASE_7_WATCHLIST_CONTROL_CERTIFICATION_V1",

    batch:
      383,

    phase:
      "PHASE 7",

    phase_name:
      "Intelligence Operations",

    generated_at:
      new Date().toISOString(),

    runtime_visible:
      true,

    status:
      certified
        ? "CERTIFIED"
        : "NOT_CERTIFIED",

    certified,

    pass,

    fail,

    checks,

    certification_basis:{

      watch_count:
        watchlists.length,

      controlled_rows:
        window.UmbraWatchlistWorkspaceControls?.controlled_rows || 0,

      control_buttons:
        window.UmbraWatchlistWorkspaceControls?.control_buttons || 0,

      state_update_status:
        stateResult?.status || null,

      active:
        summary?.active || 0,

      paused:
        summary?.paused || 0,

      escalated:
        summary?.escalated || 0,

      closed:
        summary?.closed || 0

    },

    completed_batches:[
      379,
      380,
      381,
      382
    ],

    next_required_action:
      certified
        ? "BEGIN_PHASE_7_ALERT_FOUNDATION"
        : "RESOLVE_PHASE_7_WATCHLIST_FAILURES"

  };

  window.UmbraWatchlistControlCertification =
    report;

  return report;
}

window.UmbraCertifyWatchlistControl =
  certifyWatchlistControl;

window.UmbraWatchlistControlCertificationLayer = {

  id:
    "PHASE_7_WATCHLIST_CONTROL_CERTIFICATION_LAYER_V1",

  batch:
    383,

  phase:
    "PHASE 7",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  certify_function:
    "window.UmbraCertifyWatchlistControl",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 383] Watchlist Control Certification active",
  window.UmbraWatchlistControlCertificationLayer
);

})();
