// BATCH_388_PHASE7_ALERT_CONTROL_CERTIFICATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_388_ALERT_CERTIFICATION) return;

window.__UMBRA_BATCH_388_ALERT_CERTIFICATION = true;

function certifyAlertControl(){

  window.UmbraBuildIntelligencePresentationLayer?.();
  window.UmbraBuildMissionRegistry?.();
  window.UmbraBuildWatchlistRegistry?.();

  const watchId =
    window.UmbraWatchlistRegistry?.watchlists?.[0]?.watch_id;

  if(watchId){
    window.UmbraUpdateWatchState?.(
      watchId,
      "ESCALATED",
      "Batch 388 certification setup."
    );
  }

  window.UmbraBuildAlertRegistry?.();
  window.UmbraRenderAlertWorkspaceWithControls?.();

  const alerts =
    window.UmbraAlertRegistry?.alerts || [];

  const first =
    alerts[0] || null;

  let stateResult = null;

  if(first && typeof window.UmbraUpdateAlertState === "function"){

    stateResult =
      window.UmbraUpdateAlertState(
        first.alert_id,
        "ACKNOWLEDGED",
        "Batch 388 alert certification."
      );

  }

  const summary =
    typeof window.UmbraGetAlertStateSummary === "function"
      ? window.UmbraGetAlertStateSummary()
      : null;

  const checks = [

    {
      id:"ALERT_REGISTRY_EXISTS",
      pass:alerts.length >= 20
    },

    {
      id:"ALERT_WORKSPACE_ACTIVE",
      pass:
        window.UmbraAlertWorkspaceView?.status === "ACTIVE"
    },

    {
      id:"ALERT_CONTROLS_ACTIVE",
      pass:
        window.UmbraAlertWorkspaceControls?.status === "ACTIVE"
    },

    {
      id:"ALERT_STATE_ENGINE_ACTIVE",
      pass:
        window.UmbraAlertStateEngine?.status === "ACTIVE"
    },

    {
      id:"CONTROL_ROWS_PRESENT",
      pass:
        (window.UmbraAlertWorkspaceControls?.controlled_rows || 0) >= 20
    },

    {
      id:"CONTROL_BUTTONS_PRESENT",
      pass:
        (window.UmbraAlertWorkspaceControls?.control_buttons || 0) >= 60
    },

    {
      id:"ALERT_STATE_UPDATE_WORKING",
      pass:
        stateResult?.status === "UPDATED"
    },

    {
      id:"ALERT_STATE_SUMMARY_WORKING",
      pass:
        summary?.alert_count >= 20 &&
        summary?.acknowledged >= 1
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
      "PHASE_7_ALERT_CONTROL_CERTIFICATION_V1",

    batch:
      388,

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

      alert_count:
        alerts.length,

      controlled_rows:
        window.UmbraAlertWorkspaceControls?.controlled_rows || 0,

      control_buttons:
        window.UmbraAlertWorkspaceControls?.control_buttons || 0,

      state_update_status:
        stateResult?.status || null,

      open:
        summary?.open || 0,

      acknowledged:
        summary?.acknowledged || 0,

      resolved:
        summary?.resolved || 0,

      dismissed:
        summary?.dismissed || 0

    },

    completed_batches:[
      384,
      385,
      386,
      387
    ],

    next_required_action:
      certified
        ? "BEGIN_PHASE_7_TASKING_FOUNDATION"
        : "RESOLVE_PHASE_7_ALERT_FAILURES"

  };

  window.UmbraAlertControlCertification =
    report;

  return report;
}

window.UmbraCertifyAlertControl =
  certifyAlertControl;

window.UmbraAlertControlCertificationLayer = {

  id:
    "PHASE_7_ALERT_CONTROL_CERTIFICATION_LAYER_V1",

  batch:
    388,

  phase:
    "PHASE 7",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  certify_function:
    "window.UmbraCertifyAlertControl",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 388] Alert Control Certification active",
  window.UmbraAlertControlCertificationLayer
);

})();
