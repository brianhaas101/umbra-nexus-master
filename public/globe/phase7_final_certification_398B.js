// BATCH_398B_PHASE7_FINAL_CERTIFICATION_REBUILD_FIX
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_398B_FINAL_CERTIFICATION) return;

window.__UMBRA_BATCH_398B_FINAL_CERTIFICATION = true;

function rebuildAndCertifyPhase7(){

  window.UmbraBuildIntelligencePresentationLayer?.();

  window.UmbraBuildMissionRegistry?.();
  window.UmbraBuildWatchlistRegistry?.();

  const watchId =
    window.UmbraWatchlistRegistry?.watchlists?.[0]?.watch_id;

  if(watchId){
    window.UmbraUpdateWatchState?.(
      watchId,
      "ESCALATED",
      "Batch 398B final certification rebuild."
    );
  }

  window.UmbraBuildAlertRegistry?.();
  window.UmbraBuildTaskRegistry?.();

  const missionId =
    window.UmbraMissionRegistry?.missions?.[0]?.mission_id;

  if(missionId){
    window.UmbraUpdateMissionState?.(
      missionId,
      "IN_PROGRESS",
      "Batch 398B final certification rebuild."
    );
  }

  const alertId =
    window.UmbraAlertRegistry?.alerts?.[0]?.alert_id;

  if(alertId){
    window.UmbraUpdateAlertState?.(
      alertId,
      "ACKNOWLEDGED",
      "Batch 398B final certification rebuild."
    );
  }

  const taskId =
    window.UmbraTaskRegistry?.tasks?.[0]?.task_id;

  if(taskId){
    window.UmbraUpdateTaskState?.(
      taskId,
      "IN_PROGRESS",
      "Batch 398B final certification rebuild."
    );
  }

  window.UmbraCertifyMissionControl?.();
  window.UmbraCertifyWatchlistControl?.();
  window.UmbraCertifyAlertControl?.();
  window.UmbraCertifyTaskControl?.();
  window.UmbraCertifyOperationsDashboard?.();
  window.UmbraRunPhase7FinalOperationsAudit?.();

  const checks = [
    {
      id:"MISSION_CONTROL_CERTIFIED",
      pass:window.UmbraMissionControlCertification?.certified === true
    },
    {
      id:"WATCHLIST_CONTROL_CERTIFIED",
      pass:window.UmbraWatchlistControlCertification?.certified === true
    },
    {
      id:"ALERT_CONTROL_CERTIFIED",
      pass:window.UmbraAlertControlCertification?.certified === true
    },
    {
      id:"TASK_CONTROL_CERTIFIED",
      pass:window.UmbraTaskControlCertification?.certified === true
    },
    {
      id:"OPERATIONS_DASHBOARD_CERTIFIED",
      pass:window.UmbraOperationsDashboardCertification?.certified === true
    },
    {
      id:"FINAL_OPERATIONS_AUDIT_PASS",
      pass:window.UmbraPhase7FinalOperationsAudit?.certified === true
    },
    {
      id:"MISSION_REGISTRY_VALID",
      pass:(window.UmbraMissionRegistry?.missions?.length || 0) >= 20
    },
    {
      id:"WATCHLIST_REGISTRY_VALID",
      pass:(window.UmbraWatchlistRegistry?.watchlists?.length || 0) >= 20
    },
    {
      id:"ALERT_REGISTRY_VALID",
      pass:(window.UmbraAlertRegistry?.alerts?.length || 0) >= 20
    },
    {
      id:"TASK_REGISTRY_VALID",
      pass:(window.UmbraTaskRegistry?.tasks?.length || 0) >= 20
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const report = {
    id:"PHASE_7_FINAL_CERTIFICATION_V2",
    batch:"398B",
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
      missions:window.UmbraMissionRegistry?.missions?.length || 0,
      watchlists:window.UmbraWatchlistRegistry?.watchlists?.length || 0,
      alerts:window.UmbraAlertRegistry?.alerts?.length || 0,
      tasks:window.UmbraTaskRegistry?.tasks?.length || 0
    },
    repaired_certifications:[398],
    completed_batches:[
      374,375,376,377,378,
      379,380,381,382,383,
      384,385,386,387,388,
      389,390,391,392,393,
      394,395,396,397
    ],
    next_required_action:certified
      ? "BEGIN_PHASE_8_AUTONOMOUS_OPERATIONS"
      : "RESOLVE_PHASE_7_CERTIFICATION_FAILURES"
  };

  window.UmbraPhase7FinalCertification = report;
  return report;
}

window.UmbraCertifyPhase7 = rebuildAndCertifyPhase7;

window.UmbraPhase7FinalCertificationRebuildFix = {
  id:"PHASE_7_FINAL_CERTIFICATION_REBUILD_FIX_V1",
  batch:"398B",
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  certify_function:"window.UmbraCertifyPhase7",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 398B] Phase 7 Final Certification Rebuild Fix active", window.UmbraPhase7FinalCertificationRebuildFix);

})();
