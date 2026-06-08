// BATCH_427_PHASE8_AUTONOMOUS_DIRECTIVE_CONTROLS
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_427_DIRECTIVE_CONTROLS) return;

window.__UMBRA_BATCH_427_DIRECTIVE_CONTROLS = true;

function renderAutonomousDirectiveWorkspaceWithControls(){

  window.UmbraBuildCommandSurface?.();

  const base =
    window.UmbraRenderAutonomousDirectiveWorkspace?.();

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:427,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  document
    .querySelectorAll(".umbra-directive-row")
    .forEach((row,index)=>{

      const directive =
        window.UmbraAutonomousDirectiveRegistry?.directives?.[index];

      if(!directive) return;

      row.dataset.directiveId =
        directive.directive_id;

      if(row.querySelector(".umbra-directive-controls")){
        return;
      }

      const controls =
        document.createElement("div");

      controls.className =
        "umbra-directive-controls";

      controls.innerHTML = `
        <button data-directive-action="EXECUTE">Execute</button>
        <button data-directive-action="PAUSE">Pause</button>
        <button data-directive-action="COMPLETE">Complete</button>
        <button data-directive-action="CANCEL">Cancel</button>
      `;

      row.appendChild(controls);

      controls.querySelector('[data-directive-action="EXECUTE"]').onclick = () => {
        window.UmbraUpdateAutonomousDirectiveState?.(
          directive.directive_id,
          "EXECUTING",
          "Directive execution initiated."
        );
        refreshDirectiveState(row,directive.directive_id);
      };

      controls.querySelector('[data-directive-action="PAUSE"]').onclick = () => {
        window.UmbraUpdateAutonomousDirectiveState?.(
          directive.directive_id,
          "PAUSED",
          "Directive paused."
        );
        refreshDirectiveState(row,directive.directive_id);
      };

      controls.querySelector('[data-directive-action="COMPLETE"]').onclick = () => {
        window.UmbraUpdateAutonomousDirectiveState?.(
          directive.directive_id,
          "COMPLETED",
          "Directive completed."
        );
        refreshDirectiveState(row,directive.directive_id);
      };

      controls.querySelector('[data-directive-action="CANCEL"]').onclick = () => {
        window.UmbraUpdateAutonomousDirectiveState?.(
          directive.directive_id,
          "CANCELLED",
          "Directive cancelled."
        );
        refreshDirectiveState(row,directive.directive_id);
      };

      refreshDirectiveState(row,directive.directive_id);

    });

  injectDirectiveControlStyles();

  const report = {

    id:
      "PHASE_8_AUTONOMOUS_DIRECTIVE_CONTROLS_V1",

    batch:
      427,

    phase:
      "PHASE 8",

    status:
      "ACTIVE",

    runtime_visible:
      true,

    controlled_rows:
      document.querySelectorAll(".umbra-directive-row").length,

    control_buttons:
      document.querySelectorAll(".umbra-directive-controls button").length,

    panel_id:
      "umbra-command-workspace",

    base_result:
      base || null,

    rendered_at:
      new Date().toISOString()

  };

  window.UmbraAutonomousDirectiveControls =
    report;

  return report;
}

function refreshDirectiveState(row,directiveId){

  const directive =
    window.UmbraAutonomousDirectiveRegistry?.directives?.find(
      x => x.directive_id === directiveId
    );

  if(!directive) return;

  let badge =
    row.querySelector(".umbra-directive-state-badge");

  if(!badge){
    badge = document.createElement("div");
    badge.className = "umbra-directive-state-badge";
    row.appendChild(badge);
  }

  badge.textContent =
    directive.directive_status || "ACTIVE";
}

function injectDirectiveControlStyles(){

  if(document.getElementById("umbra-directive-control-styles")){
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "umbra-directive-control-styles";

  style.textContent = `
    .umbra-directive-row{
      grid-template-columns:
        2fr
        120px
        120px
        120px
        1.4fr
        280px
        120px !important;
    }

    .umbra-directive-controls{
      display:flex;
      gap:6px;
      flex-wrap:wrap;
    }

    .umbra-directive-controls button{
      cursor:pointer;
      border:1px solid rgba(255,155,61,.22);
      background:rgba(255,155,61,.08);
      color:#ffb060;
      border-radius:8px;
      padding:6px 9px;
      font-size:11px;
      font-weight:700;
    }

    .umbra-directive-state-badge{
      color:#38e88a;
      font-size:11px;
      font-weight:800;
      letter-spacing:.08em;
    }
  `;

  document.head.appendChild(style);
}

window.UmbraRenderAutonomousDirectiveWorkspaceWithControls =
  renderAutonomousDirectiveWorkspaceWithControls;

window.UmbraAutonomousDirectiveControlsLayer = {
  id:"PHASE_8_AUTONOMOUS_DIRECTIVE_CONTROLS_LAYER_V1",
  batch:427,
  phase:"PHASE 8",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderAutonomousDirectiveWorkspaceWithControls",
  activated_at:new Date().toISOString()
};

console.log(
  "[BATCH 427] Autonomous Directive Controls active",
  window.UmbraAutonomousDirectiveControlsLayer
);

})();
