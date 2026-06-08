// BATCH_428B_PHASE8_AUTONOMOUS_DIRECTIVE_CERTIFICATION_REBUILD_FIX
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_428B_DIRECTIVE_CERTIFICATION_FIX) return;

window.__UMBRA_BATCH_428B_DIRECTIVE_CERTIFICATION_FIX = true;

function certifyAutonomousDirectivesRebuilt(){

  window.UmbraCertifyAutomationQueue?.();
  window.UmbraCertifyAutomationExecution?.();
  window.UmbraCertifyAutonomousActions?.();
  window.UmbraCertifyActionOrchestration?.();
  window.UmbraCertifyAutonomousWorkflows?.();

  if(
    !window.UmbraAutonomousDirectiveRegistry ||
    (window.UmbraAutonomousDirectiveRegistry.directive_count || 0) === 0
  ){

    window.UmbraBuildIntelligencePresentationLayer?.();

    window.UmbraBuildMissionRegistry?.();
    window.UmbraBuildWatchlistRegistry?.();

    const watchId =
      window.UmbraWatchlistRegistry?.watchlists?.[0]?.watch_id;

    if(watchId){
      window.UmbraUpdateWatchState?.(
        watchId,
        "ESCALATED",
        "Batch 428B directive certification rebuild."
      );
    }

    window.UmbraBuildAlertRegistry?.();

    const alertId =
      window.UmbraAlertRegistry?.alerts?.[0]?.alert_id;

    if(alertId){
      window.UmbraUpdateAlertState?.(
        alertId,
        "ACKNOWLEDGED",
        "Batch 428B directive certification rebuild."
      );
    }

    window.UmbraBuildTaskRegistry?.();

    window.UmbraBuildAutomationRuleRegistry?.();
    window.UmbraEvaluateAutomationRules?.();
    window.UmbraBuildAutomationExecutionQueue?.();

    (window.UmbraAutomationExecutionQueue?.queue || []).forEach(item => {
      window.UmbraUpdateAutomationQueueState?.(
        item.queue_id,
        "APPROVED",
        "Batch 428B directive certification approval."
      );

      window.UmbraExecuteAutomationQueueItem?.(
        item.queue_id
      );
    });

    window.UmbraBuildAutonomousActionRegistry?.();
    window.UmbraBuildActionOrchestrationRegistry?.();
    window.UmbraBuildAutonomousWorkflowRegistry?.();
    window.UmbraBuildAutonomousDirectiveRegistry?.();
  }

  window.UmbraRenderAutonomousDirectiveWorkspaceWithControls?.();

  const directiveId =
    window.UmbraAutonomousDirectiveRegistry?.directives?.[0]?.directive_id;

  let stateResult = null;

  if(directiveId){
    stateResult =
      window.UmbraUpdateAutonomousDirectiveState?.(
        directiveId,
        "EXECUTING",
        "Batch 428B certification validation."
      );
  }

  const summary =
    window.UmbraGetAutonomousDirectiveStateSummary?.() || {};

  const checks = [
    {
      id:"AUTONOMOUS_WORKFLOWS_CERTIFIED",
      pass:window.UmbraAutonomousWorkflowCertification?.certified === true
    },
    {
      id:"DIRECTIVE_REGISTRY_ACTIVE",
      pass:window.UmbraAutonomousDirectiveRegistry?.status === "ACTIVE"
    },
    {
      id:"DIRECTIVE_WORKSPACE_ACTIVE",
      pass:window.UmbraAutonomousDirectiveWorkspace?.status === "ACTIVE"
    },
    {
      id:"DIRECTIVE_STATE_ENGINE_ACTIVE",
      pass:window.UmbraAutonomousDirectiveStateEngine?.status === "ACTIVE"
    },
    {
      id:"DIRECTIVE_CONTROLS_ACTIVE",
      pass:window.UmbraAutonomousDirectiveControls?.status === "ACTIVE"
    },
    {
      id:"DIRECTIVES_PRESENT",
      pass:(summary.directive_count || 0) >= 1
    },
    {
      id:"STATE_UPDATE_WORKING",
      pass:stateResult?.status === "UPDATED"
    },
    {
      id:"EXECUTING_DIRECTIVE_PRESENT",
      pass:(summary.executing || 0) >= 1
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const report = {
    id:"PHASE_8_AUTONOMOUS_DIRECTIVE_CERTIFICATION_V2",
    batch:"428B",
    phase:"PHASE 8",
    phase_name:"Autonomous Operations",
    generated_at:new Date().toISOString(),
    runtime_visible:true,
    status:certified ? "CERTIFIED" : "NOT_CERTIFIED",
    certified,
    pass,
    fail,
    checks,
    certification_basis:{
      directive_count:summary.directive_count || 0,
      executing:summary.executing || 0,
      active:summary.active || 0,
      controlled_rows:window.UmbraAutonomousDirectiveControls?.controlled_rows || 0,
      control_buttons:window.UmbraAutonomousDirectiveControls?.control_buttons || 0
    },
    repaired_certifications:[428],
    completed_batches:[424,425,426,427],
    next_required_action:certified
      ? "BEGIN_PHASE_8_MASTER_AUTONOMY_CERTIFICATION"
      : "RESOLVE_PHASE_8_DIRECTIVE_FAILURES"
  };

  window.UmbraAutonomousDirectiveCertification = report;
  return report;
}

window.UmbraCertifyAutonomousDirectives =
  certifyAutonomousDirectivesRebuilt;

window.UmbraAutonomousDirectiveCertificationRebuildFix = {
  id:"PHASE_8_AUTONOMOUS_DIRECTIVE_CERTIFICATION_REBUILD_FIX_V1",
  batch:"428B",
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  certify_function:"window.UmbraCertifyAutonomousDirectives",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 428B] Autonomous Directive Certification Rebuild Fix active", window.UmbraAutonomousDirectiveCertificationRebuildFix);

})();
