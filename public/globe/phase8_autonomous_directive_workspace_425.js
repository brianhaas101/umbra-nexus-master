// BATCH_425_PHASE8_AUTONOMOUS_DIRECTIVE_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_425_DIRECTIVE_WORKSPACE) return;

window.__UMBRA_BATCH_425_DIRECTIVE_WORKSPACE = true;

function renderAutonomousDirectiveWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraAutonomousDirectiveRegistry){
    window.UmbraBuildAutonomousDirectiveRegistry?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:425,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const directives =
    window.UmbraAutonomousDirectiveRegistry?.directives || [];

  const metrics =
    window.UmbraGetAutonomousDirectiveMetrics?.() || {};

  const rows = directives.map(directive => `
    <div class="umbra-directive-row"
         data-directive-id="${directive.directive_id}">

      <div>
        <div class="umbra-directive-label">
          ${directive.directive_id}
        </div>

        <strong>
          ${directive.directive_name}
        </strong>
      </div>

      <div>${directive.directive_status}</div>

      <div>${directive.priority}</div>

      <div>${directive.workflow_count}</div>

      <div>${directive.workflow_ids.join(", ")}</div>

    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:22px;
      ">

        <div>

          <div style="
            color:#ff9b3d;
            font-size:11px;
            letter-spacing:.18em;
          ">
            PHASE 8 · AUTONOMOUS DIRECTIVES
          </div>

          <h1 style="
            margin:4px 0;
            color:#f1f5f9;
          ">
            Autonomous Directive Workspace
          </h1>

          <div style="opacity:.7;">
            Strategic directive layer governing workflows.
          </div>

        </div>

        <div style="
          padding:12px 18px;
          border-radius:12px;
          border:1px solid rgba(56,232,138,.24);
          background:rgba(56,232,138,.06);
          color:#38e88a;
          font-weight:700;
        ">
          ${metrics.active || 0} ACTIVE
        </div>

      </div>

      <div class="umbra-directive-metrics">

        <div class="umbra-directive-card">
          <span>Directives</span>
          <strong>${metrics.directive_count || 0}</strong>
        </div>

        <div class="umbra-directive-card">
          <span>Workflows</span>
          <strong>${metrics.total_workflows || 0}</strong>
        </div>

        <div class="umbra-directive-card">
          <span>High Priority</span>
          <strong>${metrics.high_priority || 0}</strong>
        </div>

      </div>

      <div class="umbra-directive-grid">
        ${rows || `
          <div style="opacity:.65;">
            No directives available.
          </div>
        `}
      </div>

    </div>

    <style>

      .umbra-directive-metrics{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:14px;
        margin-bottom:18px;
      }

      .umbra-directive-card{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:
          linear-gradient(
            180deg,
            rgba(12,17,30,.88),
            rgba(7,10,18,.84)
          );
      }

      .umbra-directive-card span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-directive-card strong{
        display:block;
        margin-top:8px;
        font-size:32px;
        color:#ffb060;
      }

      .umbra-directive-grid{
        display:grid;
        gap:10px;
      }

      .umbra-directive-row{
        display:grid;
        grid-template-columns:
          2fr
          140px
          140px
          140px
          2fr;
        gap:14px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:
          linear-gradient(
            180deg,
            rgba(12,17,30,.88),
            rgba(7,10,18,.84)
          );
      }

      .umbra-directive-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }

    </style>
  `;

  const report = {

    id:
      "PHASE_8_AUTONOMOUS_DIRECTIVE_WORKSPACE_V1",

    batch:
      425,

    phase:
      "PHASE 8",

    status:
      "ACTIVE",

    runtime_visible:
      true,

    directive_count:
      metrics.directive_count || 0,

    total_workflows:
      metrics.total_workflows || 0,

    panel_id:
      "umbra-command-workspace",

    rendered_at:
      new Date().toISOString()

  };

  window.UmbraAutonomousDirectiveWorkspace =
    report;

  return report;
}

window.UmbraRenderAutonomousDirectiveWorkspace =
  renderAutonomousDirectiveWorkspace;

window.UmbraAutonomousDirectiveWorkspaceLayer = {

  id:
    "PHASE_8_AUTONOMOUS_DIRECTIVE_WORKSPACE_LAYER_V1",

  batch:
    425,

  phase:
    "PHASE 8",

  status:
    "ACTIVE",

  runtime_visible:
    true,

  render_function:
    "window.UmbraRenderAutonomousDirectiveWorkspace",

  activated_at:
    new Date().toISOString()

};

console.log(
  "[BATCH 425] Autonomous Directive Workspace active",
  window.UmbraAutonomousDirectiveWorkspaceLayer
);

})();
