// BATCH_424_PHASE8_AUTONOMOUS_DIRECTIVE_FOUNDATION
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_424_DIRECTIVE_FOUNDATION) return;

window.__UMBRA_BATCH_424_DIRECTIVE_FOUNDATION = true;

function buildAutonomousDirectiveRegistry(){

  const workflows =
    window.UmbraAutonomousWorkflowRegistry?.workflows || [];

  const directives = [];

  if(workflows.length){

    directives.push({

      directive_id:
        "DIR-001",

      directive_name:
        "Primary Autonomous Directive",

      directive_status:
        "ACTIVE",

      priority:
        "HIGH",

      workflow_count:
        workflows.length,

      workflow_ids:
        workflows.map(
          w => w.workflow_id
        ),

      generated_at:
        new Date().toISOString()

    });
  }

  const registry = {

    id:
      "PHASE_8_AUTONOMOUS_DIRECTIVE_REGISTRY_V1",

    batch:
      424,

    phase:
      "PHASE 8",

    phase_name:
      "Autonomous Operations",

    runtime_visible:
      true,

    status:
      "ACTIVE",

    directive_count:
      directives.length,

    active:
      directives.filter(
        x => x.directive_status === "ACTIVE"
      ).length,

    directives

  };

  window.UmbraAutonomousDirectiveRegistry =
    registry;

  return registry;
}

function getAutonomousDirectiveMetrics(){

  const directives =
    window.UmbraAutonomousDirectiveRegistry?.directives || [];

  return {

    id:
      "PHASE_8_AUTONOMOUS_DIRECTIVE_METRICS_V1",

    batch:
      424,

    runtime_visible:
      true,

    directive_count:
      directives.length,

    active:
      directives.filter(
        x => x.directive_status === "ACTIVE"
      ).length,

    total_workflows:
      directives.reduce(
        (sum,d) => sum + (d.workflow_count || 0),
        0
      ),

    high_priority:
      directives.filter(
        x => x.priority === "HIGH"
      ).length

  };
}

window.UmbraBuildAutonomousDirectiveRegistry =
  buildAutonomousDirectiveRegistry;

window.UmbraGetAutonomousDirectiveMetrics =
  getAutonomousDirectiveMetrics;

window.UmbraAutonomousDirectiveFoundation = {

  id:
    "PHASE_8_AUTONOMOUS_DIRECTIVE_FOUNDATION_V1",

  batch:
    424,

  phase:
    "PHASE 8",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  registry_function:
    "window.UmbraBuildAutonomousDirectiveRegistry",

  metrics_function:
    "window.UmbraGetAutonomousDirectiveMetrics",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 424] Autonomous Directive Foundation active",
  window.UmbraAutonomousDirectiveFoundation
);

})();
