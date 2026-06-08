// BATCH_397_PHASE7_FINAL_OPERATIONS_AUDIT
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_397_FINAL_OPS_AUDIT) return;

window.__UMBRA_BATCH_397_FINAL_OPS_AUDIT = true;

function runPhase7FinalOperationsAudit(){

  window.UmbraBuildIntelligencePresentationLayer?.();

  window.UmbraBuildMissionRegistry?.();
  window.UmbraBuildWatchlistRegistry?.();

  const watchId =
    window.UmbraWatchlistRegistry?.watchlists?.[0]?.watch_id;

  if(watchId){
    window.UmbraUpdateWatchState?.(
      watchId,
      "ESCALATED",
      "Batch 397 final operations audit setup."
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
      "Batch 397 final operations audit."
    );
  }

  const alertId =
    window.UmbraAlertRegistry?.alerts?.[0]?.alert_id;

  if(alertId){
    window.UmbraUpdateAlertState?.(
      alertId,
      "ACKNOWLEDGED",
      "Batch 397 final operations audit."
    );
  }

  const taskId =
    window.UmbraTaskRegistry?.tasks?.[0]?.task_id;

  if(taskId){
    window.UmbraUpdateTaskState?.(
      taskId,
      "IN_PROGRESS",
      "Batch 397 final operations audit."
    );
  }

  window.UmbraBuildOperationsDashboard?.();
  window.UmbraRenderOperationsDashboardWorkspace?.();

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
    },
    {
      id:"OPERATIONS_DASHBOARD_ACTIVE",
      pass:window.UmbraOperationsDashboard?.status === "ACTIVE"
    },
    {
      id:"OPERATIONS_WORKSPACE_ACTIVE",
      pass:window.UmbraOperationsDashboardWorkspace?.status === "ACTIVE"
    },
    {
      id:"WORKSPACE_PANEL_PRESENT",
      pass:!!document.getElementById("umbra-command-workspace")
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const metrics =
    window.UmbraGetOperationsDashboardMetrics?.() || {};

  const report = {
    id:"PHASE_7_FINAL_OPERATIONS_AUDIT_V1",
    batch:397,
    phase:"PHASE 7",
    phase_name:"Intelligence Operations",
    generated_at:new Date().toISOString(),
    runtime_visible:true,
    status:certified ? "PASS" : "FAIL",
    certified,
    pass,
    fail,
    checks,
    audit_basis:{
      missions:window.UmbraMissionRegistry?.missions?.length || 0,
      watchlists:window.UmbraWatchlistRegistry?.watchlists?.length || 0,
      alerts:window.UmbraAlertRegistry?.alerts?.length || 0,
      tasks:window.UmbraTaskRegistry?.tasks?.length || 0,
      dashboard_metrics:metrics
    },
    completed_batches:[
      378,
      383,
      388,
      393,
      396
    ],
    next_required_action:certified
      ? "BEGIN_PHASE_7_FINAL_CERTIFICATION"
      : "RESOLVE_PHASE_7_FINAL_OPERATIONS_AUDIT_FAILURES"
  };

  window.UmbraPhase7FinalOperationsAudit = report;

  return report;
}

window.UmbraRunPhase7FinalOperationsAudit =
  runPhase7FinalOperationsAudit;

window.UmbraPhase7FinalOperationsAuditLayer = {
  id:"PHASE_7_FINAL_OPERATIONS_AUDIT_LAYER_V1",
  batch:397,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  audit_function:"window.UmbraRunPhase7FinalOperationsAudit",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 397] Phase 7 Final Operations Audit active", window.UmbraPhase7FinalOperationsAuditLayer);

})();
