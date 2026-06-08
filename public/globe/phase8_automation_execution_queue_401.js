// BATCH_401_PHASE8_AUTOMATION_EXECUTION_QUEUE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_401_EXECUTION_QUEUE) return;

window.__UMBRA_BATCH_401_EXECUTION_QUEUE = true;

function buildAutomationExecutionQueue(){

  const events =
    window.UmbraAutomationEvaluation?.events || [];

  const queue = events
    .map((event, index) => ({
      queue_id:
        "AUTO-QUEUE-" + String(index + 1).padStart(3, "0"),

      event_id:
        event.event_id,

      rule_id:
        event.rule_id,

      candidate_id:
        event.candidate_id,

      source_type:
        event.source_type,

      action:
        event.action,

      priority:
        event.priority,

      queue_status:
        "PENDING",

      queued_at:
        new Date().toISOString()
    }))
    .sort((a,b) => {

      const rank = {
        HIGH:2,
        NORMAL:1,
        LOW:0
      };

      return (
        (rank[b.priority] || 0) -
        (rank[a.priority] || 0)
      );

    });

  const registry = {

    id:
      "PHASE_8_AUTOMATION_EXECUTION_QUEUE_V1",

    batch:
      401,

    phase:
      "PHASE 8",

    phase_name:
      "Autonomous Operations",

    generated_at:
      new Date().toISOString(),

    runtime_visible:
      true,

    status:
      "ACTIVE",

    queue_count:
      queue.length,

    pending:
      queue.filter(
        x => x.queue_status === "PENDING"
      ).length,

    queue

  };

  window.UmbraAutomationExecutionQueue =
    registry;

  return registry;
}

function getAutomationQueueMetrics(){

  const queue =
    window.UmbraAutomationExecutionQueue?.queue || [];

  return {

    id:
      "PHASE_8_AUTOMATION_QUEUE_METRICS_V1",

    batch:
      401,

    runtime_visible:
      true,

    queue_count:
      queue.length,

    pending:
      queue.filter(
        x => x.queue_status === "PENDING"
      ).length,

    high_priority:
      queue.filter(
        x => x.priority === "HIGH"
      ).length,

    normal_priority:
      queue.filter(
        x => x.priority === "NORMAL"
      ).length

  };
}

window.UmbraBuildAutomationExecutionQueue =
  buildAutomationExecutionQueue;

window.UmbraGetAutomationQueueMetrics =
  getAutomationQueueMetrics;

window.UmbraAutomationExecutionQueueLayer = {

  id:
    "PHASE_8_AUTOMATION_EXECUTION_QUEUE_LAYER_V1",

  batch:
    401,

  phase:
    "PHASE 8",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  queue_function:
    "window.UmbraBuildAutomationExecutionQueue",

  metrics_function:
    "window.UmbraGetAutomationQueueMetrics",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 401] Automation Execution Queue active",
  window.UmbraAutomationExecutionQueueLayer
);

})();
