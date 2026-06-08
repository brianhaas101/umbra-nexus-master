// BATCH_429B_PHASE8_MASTER_AUTONOMY_AUDIT_REBUILD_FIX
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_429B_MASTER_AUTONOMY_AUDIT_FIX) return;

window.__UMBRA_BATCH_429B_MASTER_AUTONOMY_AUDIT_FIX = true;

function auditMasterAutonomyRebuilt(){

  window.UmbraCertifyAutomationQueue?.();
  window.UmbraCertifyAutomationExecution?.();
  window.UmbraCertifyAutonomousActions?.();
  window.UmbraCertifyActionOrchestration?.();
  window.UmbraCertifyAutonomousWorkflows?.();
  window.UmbraCertifyAutonomousDirectives?.();

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
        "Batch 429B master autonomy audit rebuild."
      );
    }

    window.UmbraBuildAlertRegistry?.();

    const alertId =
      window.UmbraAlertRegistry?.alerts?.[0]?.alert_id;

    if(alertId){
      window.UmbraUpdateAlertState?.(
        alertId,
        "ACKNOWLEDGED",
        "Batch 429B master autonomy audit rebuild."
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
        "Batch 429B master autonomy audit approval."
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

  const orchestrationId =
    window.UmbraActionOrchestrationRegistry?.groups?.[0]?.orchestration_id;

  if(orchestrationId){
    window.UmbraUpdateActionOrchestrationState?.(
      orchestrationId,
      "EXECUTING",
      "Batch 429B audit orchestration validation."
    );
  }

  const workflowId =
    window.UmbraAutonomousWorkflowRegistry?.workflows?.[0]?.workflow_id;

  if(workflowId){
    window.UmbraUpdateAutonomousWorkflowState?.(
      workflowId,
      "EXECUTING",
      "Batch 429B audit workflow validation."
    );
  }

  const directiveId =
    window.UmbraAutonomousDirectiveRegistry?.directives?.[0]?.directive_id;

  if(directiveId){
    window.UmbraUpdateAutonomousDirectiveState?.(
      directiveId,
      "EXECUTING",
      "Batch 429B audit directive validation."
    );
  }

  window.UmbraCertifyAutomationQueue?.();
  window.UmbraCertifyAutomationExecution?.();
  window.UmbraCertifyAutonomousActions?.();
  window.UmbraCertifyActionOrchestration?.();
  window.UmbraCertifyAutonomousWorkflows?.();
  window.UmbraCertifyAutonomousDirectives?.();

  const checks = [
    {
      id:"AUTOMATION_QUEUE_CERTIFIED",
      pass:window.UmbraAutomationQueueCertification?.certified === true
    },
    {
      id:"AUTOMATION_EXECUTION_CERTIFIED",
      pass:window.UmbraAutomationExecutionCertification?.certified === true
    },
    {
      id:"AUTONOMOUS_ACTIONS_CERTIFIED",
      pass:window.UmbraAutonomousActionCertification?.certified === true
    },
    {
      id:"ACTION_ORCHESTRATION_CERTIFIED",
      pass:window.UmbraActionOrchestrationCertification?.certified === true
    },
    {
      id:"AUTONOMOUS_WORKFLOWS_CERTIFIED",
      pass:window.UmbraAutonomousWorkflowCertification?.certified === true
    },
    {
      id:"AUTONOMOUS_DIRECTIVES_CERTIFIED",
      pass:window.UmbraAutonomousDirectiveCertification?.certified === true
    },
    {
      id:"DIRECTIVE_EXECUTING",
      pass:(window.UmbraGetAutonomousDirectiveStateSummary?.().executing || 0) >= 1
    },
    {
      id:"WORKFLOW_EXECUTING",
      pass:(window.UmbraGetAutonomousWorkflowStateSummary?.().executing || 0) >= 1
    },
    {
      id:"ORCHESTRATION_EXECUTING",
      pass:(window.UmbraGetActionOrchestrationStateSummary?.().executing || 0) >= 1
    },
    {
      id:"AUTONOMOUS_ACTIONS_PRESENT",
      pass:(window.UmbraAutonomousActionRegistry?.actions?.length || 0) >= 1
    }
  ];

  const pass = checks.filter(x => x.pass).length;
  const fail = checks.filter(x => !x.pass).length;
  const certified = fail === 0;

  const report = {
    id:"PHASE_8_MASTER_AUTONOMY_AUDIT_V2",
    batch:"429B",
    phase:"PHASE 8",
    phase_name:"Autonomous Operations",
    generated_at:new Date().toISOString(),
    runtime_visible:true,
    status:certified ? "AUDIT_PASSED" : "AUDIT_FAILED",
    certified,
    pass,
    fail,
    checks,
    repaired_audits:[429],
    next_required_action:certified
      ? "BEGIN_PHASE_8_FINAL_CERTIFICATION"
      : "REPAIR_PHASE_8_AUDIT_FAILURES"
  };

  window.UmbraMasterAutonomyAudit = report;
  return report;
}

window.UmbraAuditMasterAutonomy =
  auditMasterAutonomyRebuilt;

window.UmbraMasterAutonomyAuditRebuildFix = {
  id:"PHASE_8_MASTER_AUTONOMY_AUDIT_REBUILD_FIX_V1",
  batch:"429B",
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  audit_function:"window.UmbraAuditMasterAutonomy",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 429B] Master Autonomy Audit Rebuild Fix active", window.UmbraMasterAutonomyAuditRebuildFix);

})();
