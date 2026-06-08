// BATCH_390_PHASE7_TASK_WORKSPACE
(function(){

if(typeof window === "undefined") return;
if(window.__UMBRA_BATCH_390_TASK_WORKSPACE) return;

window.__UMBRA_BATCH_390_TASK_WORKSPACE = true;

function renderTaskWorkspace(){

  window.UmbraBuildCommandSurface?.();

  if(!window.UmbraTaskRegistry){
    window.UmbraBuildTaskRegistry?.();
  }

  const workspace =
    document.getElementById("umbra-command-workspace");

  if(!workspace){
    return {
      batch:390,
      status:"WORKSPACE_NOT_FOUND"
    };
  }

  const tasks =
    window.UmbraTaskRegistry?.tasks || [];

  const metrics =
    typeof window.UmbraGetTaskMetrics === "function"
      ? window.UmbraGetTaskMetrics()
      : {};

  const rows = tasks.map(task => `
    <div class="umbra-task-row" data-task-id="${task.task_id}">
      <div>
        <div class="umbra-task-label">${task.task_id}</div>
        <strong>${task.candidate_name}</strong>
        <div class="umbra-task-meta">${task.candidate_id}</div>
      </div>

      <div>${task.task_type}</div>
      <div>${task.priority}</div>
      <div>${task.task_status}</div>
      <div>${task.alert_id}</div>
      <div>${task.assigned_to || "UNASSIGNED"}</div>
    </div>
  `).join("");

  workspace.innerHTML = `
    <div style="max-width:1500px;margin:0 auto;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <div>
          <div style="color:#ff9b3d;font-size:11px;letter-spacing:.18em;">
            PHASE 7 · TASKING
          </div>

          <h1 style="margin:4px 0;color:#f1f5f9;">
            Task Workspace
          </h1>

          <div style="opacity:.7;">
            Operational execution layer generated from alerts and watchlist escalation.
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
          ${metrics.open || 0} OPEN TASKS
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:18px;">
        <div class="umbra-task-metric"><span>Total</span><strong>${metrics.task_count || 0}</strong></div>
        <div class="umbra-task-metric"><span>Open</span><strong>${metrics.open || 0}</strong></div>
        <div class="umbra-task-metric"><span>In Progress</span><strong>${metrics.in_progress || 0}</strong></div>
        <div class="umbra-task-metric"><span>Completed</span><strong>${metrics.completed || 0}</strong></div>
        <div class="umbra-task-metric"><span>High</span><strong>${metrics.high_priority || 0}</strong></div>
      </div>

      <div class="umbra-task-grid">
        ${rows || `<div style="opacity:.65;">No task records available.</div>`}
      </div>

    </div>

    <style>
      .umbra-task-metric{
        border:1px solid rgba(255,155,61,.14);
        border-radius:16px;
        padding:16px;
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-task-metric span{
        display:block;
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
      }

      .umbra-task-metric strong{
        display:block;
        margin-top:6px;
        font-size:30px;
        color:#ffb060;
      }

      .umbra-task-grid{
        display:grid;
        gap:10px;
      }

      .umbra-task-row{
        display:grid;
        grid-template-columns:2fr 150px 120px 140px 130px 160px;
        gap:14px;
        align-items:center;
        padding:16px;
        border-radius:14px;
        border:1px solid rgba(255,155,61,.14);
        background:linear-gradient(180deg, rgba(12,17,30,.88), rgba(7,10,18,.84));
      }

      .umbra-task-label{
        color:#ff9b3d;
        font-size:10px;
        letter-spacing:.14em;
        margin-bottom:4px;
      }

      .umbra-task-meta{
        opacity:.62;
        font-size:12px;
        margin-top:4px;
      }
    </style>
  `;

  const report = {
    id:"PHASE_7_TASK_WORKSPACE_VIEW_V1",
    batch:390,
    phase:"PHASE 7",
    status:"ACTIVE",
    runtime_visible:true,
    task_count:tasks.length,
    open_count:metrics.open || 0,
    high_priority:metrics.high_priority || 0,
    panel_id:"umbra-command-workspace",
    rendered_at:new Date().toISOString()
  };

  window.UmbraTaskWorkspaceView = report;
  return report;
}

window.UmbraRenderTaskWorkspace =
  renderTaskWorkspace;

window.UmbraTaskWorkspaceLayer = {
  id:"PHASE_7_TASK_WORKSPACE_LAYER_V1",
  batch:390,
  phase:"PHASE 7",
  status:"ACTIVE",
  runtime_visible:true,
  render_function:"window.UmbraRenderTaskWorkspace",
  activated_at:new Date().toISOString()
};

console.log("[BATCH 390] Task Workspace active", window.UmbraTaskWorkspaceLayer);

})();
