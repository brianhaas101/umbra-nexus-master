// BATCH_378_PHASE7_MISSION_CONTROL_CERTIFICATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_378_MISSION_CONTROL_CERT) return;

window.__UMBRA_BATCH_378_MISSION_CONTROL_CERT = true;

function certifyMissionControl(){

  window.UmbraBuildIntelligencePresentationLayer?.();
  window.UmbraBuildMissionRegistry?.();
  window.UmbraRenderMissionWorkspaceWithControls?.();

  const missions =
    window.UmbraMissionRegistry?.missions || [];

  const first =
    missions[0] || null;

  let stateResult = null;

  if(first && typeof window.UmbraUpdateMissionState === "function"){
    stateResult =
      window.UmbraUpdateMissionState(
        first.mission_id,
        "IN_PROGRESS",
        "Batch 378 mission control certification."
      );
  }

  const summary =
    typeof window.UmbraGetMissionStateSummary === "function"
      ? window.UmbraGetMissionStateSummary()
      : null;

  const checks = [
    {
      id:"MISSION_REGISTRY_EXISTS",
      pass:missions.length >= 20
    },
    {
      id:"MISSION_WORKSPACE_ACTIVE",
      pass:window.UmbraMissionWorkspaceView?.status === "ACTIVE"
    },
    {
      id:"MISSION_CONTROLS_ACTIVE",
      pass:window.UmbraMissionWorkspaceControls?.status === "ACTIVE"
    },
    {
      id:"CONTROL_ROWS_PRESENT",
      pass:(window.UmbraMissionWorkspaceControls?.controlled_rows || 0) >= 20
    },
    {
      id:"CONTROL_BUTTONS_PRESENT",
      pass:(window.UmbraMissionWorkspaceControls?.control_buttons || 0) >= 80
    },
    {
      id:"MISSION_STATE_UPDATE_WORKING",
      pass:stateResult?.status === "UPDATED"
    },
    {
      id:"MISSION_STATE_SUMMARY_WORKING",
      pass:summary?.mission_count >= 20 && summary?.in_progress >= 1
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const report = {
    id:"PHASE_7_MISSION_CONTROL_CERTIFICATION_V1",
    batch:378,
    phase:"PHASE 7",
    phase_name:"Intelligence Operations",
    generated_at:new Date().toISOString(),
    runtime_visible:true,
    status:certified ? "CERTIFIED" : "NOT_CERTIFIED",
    certified,
    pass,
    fail,
    checks,
    certification_basis:{
      mission_count:missions.length,
      controlled_rows:window.UmbraMissionWorkspaceControls?.controlled_rows || 0,
      control_buttons:window.UmbraMissionWorkspaceControls?.control_buttons || 0,
      state_update_status:stateResult?.status || null,
      open:summary?.open || 0,
      in_progress:summary?.in_progress || 0,
      completed:summary?.completed || 0,
      blocked:summary?.blocked || 0,
      cancelled:summary?.cancelled || 0
    },
    completed_batches:[
      374,
      375,
      376,
      377
    ],
    next_required_action:certified
      ? "BEGIN_PHASE_7_WATCHLIST_FOUNDATION"
      : "RESOLVE_PHASE_7_MISSION_CONTROL_FAILURES"
  };

  window.UmbraMissionControlCertification = report;
  return report;
}

window.UmbraCertifyMissionControl = certifyMissionControl;

window.UmbraMissionControlCertificationLayer = {
  id:"PHASE_7_MISSION_CONTROL_CERTIFICATION_LAYER_V1",
  batch:378,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  certify_function:"window.UmbraCertifyMissionControl",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 378] Mission Control Certification active", window.UmbraMissionControlCertificationLayer);

})();
