(function(){

"use strict";

const MODULE_ID =
"NEXUS_UX_WORKSPACE_INVENTORY_C1";

const state = {
  module: MODULE_ID,
  phase: "UX_C1",
  status: "ACTIVE",
  mode: "WORKSPACE_MOUNT_INVENTORY",
  lastAudit: null,
  history: [],
  createdAt: new Date().toISOString()
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function rectOf(el){
  if(!el){
    return null;
  }

  const r = el.getBoundingClientRect();

  return {
    x: Math.round(r.left),
    y: Math.round(r.top),
    width: Math.round(r.width),
    height: Math.round(r.height),
    area: Math.round(r.width * r.height),
    visible: r.width > 0 && r.height > 0
  };
}

function classifyNode(el){

  const id = el.id || "";
  const cls =
  typeof el.className === "string"
    ? el.className
    : "";

  const text =
  String(el.innerText || "")
    .trim()
    .replace(/\s+/g," ")
    .slice(0,160);

  const key =
  (id + " " + cls + " " + text).toLowerCase();

  if(key.includes("dossier")){
    return "DOSSIER";
  }

  if(
    key.includes("operation") ||
    key.includes("mission") ||
    key.includes("task") ||
    key.includes("alert") ||
    key.includes("watchlist")
  ){
    return "OPERATIONS";
  }

  if(
    key.includes("automation") ||
    key.includes("autonomous") ||
    key.includes("orchestration")
  ){
    return "AUTOMATION";
  }

  if(
    key.includes("governance") ||
    key.includes("continuity") ||
    key.includes("audit")
  ){
    return "GOVERNANCE";
  }

  if(
    key.includes("intel") ||
    key.includes("intelligence") ||
    key.includes("queue") ||
    key.includes("priority") ||
    key.includes("decision")
  ){
    return "INTELLIGENCE";
  }

  if(
    key.includes("founder") ||
    key.includes("executive") ||
    key.includes("profile")
  ){
    return "FOUNDER";
  }

  if(
    key.includes("command") ||
    key.includes("workspace")
  ){
    return "COMMAND";
  }

  return "UNCLASSIFIED";

}

function auditWorkspace(){

  const workspace =
  document.getElementById("umbra-command-workspace");

  const commandSurface =
  document.getElementById("umbra-command-surface");

  const centerStage =
  document.getElementById("centerStage");

  const viewHub =
  document.getElementById("viewHub");

  const globe =
  document.getElementById("globeContainer");

  const directChildren =
  workspace
    ? Array.from(workspace.children)
    : [];

  const childReport =
  directChildren.map(function(el,index){

    return {
      index,
      tag: el.tagName.toLowerCase(),
      id: el.id || "",
      className:
      typeof el.className === "string"
        ? el.className.slice(0,120)
        : "",
      category: classifyNode(el),
      text: String(el.innerText || "")
        .trim()
        .replace(/\s+/g," ")
        .slice(0,180),
      rect: rectOf(el)
    };

  });

  const byCategory =
  childReport.reduce(function(acc,item){
    acc[item.category] =
    acc[item.category] || 0;

    acc[item.category] += 1;

    return acc;
  },{});

  const report = {
    module: MODULE_ID,
    phase: "UX_C1",
    timestamp: new Date().toISOString(),

    surfaces: {
      commandSurface: rectOf(commandSurface),
      workspace: rectOf(workspace),
      centerStage: rectOf(centerStage),
      viewHub: rectOf(viewHub),
      globeContainer: rectOf(globe)
    },

    workspace: {
      present: !!workspace,
      directChildCount: childReport.length,
      byCategory,
      children: childReport
    },

    diagnosis: {
      workspaceOverloaded: childReport.length > 3,
      mixedCategories: Object.keys(byCategory).length > 2,
      needsSeparation:
        childReport.length > 3 ||
        Object.keys(byCategory).length > 2
    }
  };

  state.lastAudit = clone(report);
  state.history.push(clone(report));

  if(state.history.length > 20){
    state.history.shift();
  }

  console.group("NEXUS UX WORKSPACE INVENTORY C1");
  console.log("Surfaces:", report.surfaces);
  console.log("Workspace Summary:", report.workspace);
  console.log("Diagnosis:", report.diagnosis);
  console.table(childReport);
  console.groupEnd();

  return clone(report);

}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_C1",
    status: state.status,
    mode: state.mode,
    hasLastAudit: !!state.lastAudit,
    historyCount: state.history.length,
    lastDiagnosis: state.lastAudit
      ? state.lastAudit.diagnosis
      : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXWorkspaceInventoryC1 = {
  id: MODULE_ID,
  phase: "UX_C1",
  auditWorkspace,
  getState
};

console.log(MODULE_ID,getState());

})();
