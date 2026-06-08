// BATCH_393_PHASE7_TASK_CONTROL_CERTIFICATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_393_TASK_CERTIFICATION) return;

window.__UMBRA_BATCH_393_TASK_CERTIFICATION = true;

function certifyTaskControl(){

  window.UmbraBuildIntelligencePresentationLayer?.();
  window.UmbraBuildMissionRegistry?.();
  window.UmbraBuildWatchlistRegistry?.();

  const watchId =
    window.UmbraWatchlistRegistry?.watchlists?.[0]?.watch_id;

  if(watchId){
    window.UmbraUpdateWatchState?.(
      watchId,
      "ESCALATED",
      "Batch 393 certification setup."
    );
  }

  window.UmbraBuildAlertRegistry?.();
  window.UmbraBuildTaskRegistry?.();
  window.UmbraRenderTaskWorkspaceWithControls?.();

  const tasks =
    window.UmbraTaskRegistry?.tasks || [];

  const first =
    tasks[0] || null;

  let stateResult = null;

  if(first && typeof window.UmbraUpdateTaskState === "function"){
    stateResult =
      window.UmbraUpdateTaskState(
        first.task_id,
        "IN_PROGRESS",
        "Batch 393 task certification."
      );
  }

  const summary =
    typeof window.UmbraGetTaskStateSummary === "function"
      ? window.UmbraGetTaskStateSummary()
      : null;

  const checks = [
    {
      id:"TASK_REGISTRY_EXISTS",
      pass:tasks.length >= 20
    },
    {
      id:"TASK_WORKSPACE_ACTIVE",
      pass:window.UmbraTaskWorkspaceView?.status === "ACTIVE"
    },
    {
      id:"TASK_CONTROLS_ACTIVE",
      pass:window.UmbraTaskWorkspaceControls?.status === "ACTIVE"
    },
    {
      id:"TASK_STATE_ENGINE_ACTIVE",
      pass:window.UmbraTaskStateEngine?.status === "ACTIVE"
    },
    {
      id:"CONTROL_ROWS_PRESENT",
      pass:(window.UmbraTaskWorkspaceControls?.controlled_rows || 0) >= 20
    },
    {
      id:"CONTROL_BUTTONS_PRESENT",
      pass:(window.UmbraTaskWorkspaceControls?.control_buttons || 0) >= 80
    },
    {
      id:"TASK_STATE_UPDATE_WORKING",
      pass:stateResult?.status === "UPDATED"
    },
    {
      id:"TASK_STATE_SUMMARY_WORKING",
      pass:
        summary?.task_count >= 20 &&
        summary?.in_progress >= 1
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const report = {
    id:"PHASE_7_TASK_CONTROL_CERTIFICATION_V1",
    batch:393,
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
      task_count:tasks.length,
      controlled_rows:window.UmbraTaskWorkspaceControls?.controlled_rows || 0,
      control_buttons:window.UmbraTaskWorkspaceControls?.control_buttons || 0,
      state_update_status:stateResult?.status || null,
      open:summary?.open || 0,
      in_progress:summary?.in_progress || 0,
      blocked:summary?.blocked || 0,
      completed:summary?.completed || 0,
      cancelled:summary?.cancelled || 0
    },
    completed_batches:[
      389,
      390,
      391,
      392
    ],
    next_required_action:certified
      ? "BEGIN_PHASE_7_OPERATIONS_DASHBOARD"
      : "RESOLVE_PHASE_7_TASK_FAILURES"
  };

  window.UmbraTaskControlCertification = report;
  return report;
}

window.UmbraCertifyTaskControl = certifyTaskControl;

window.UmbraTaskControlCertificationLayer = {
  id:"PHASE_7_TASK_CONTROL_CERTIFICATION_LAYER_V1",
  batch:393,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  certify_function:"window.UmbraCertifyTaskControl",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 393] Task Control Certification active", window.UmbraTaskControlCertificationLayer);

})();
