(function(){

"use strict";

const MODULE_ID = "NEXUS_UX_VISIBLE_PANEL_OWNERSHIP_D1";

const state = {
  module: MODULE_ID,
  phase: "UX_D1",
  status: "ACTIVE",
  mode: "VISIBLE_PANEL_OWNERSHIP_AUDIT",
  lastAudit: null,
  createdAt: new Date().toISOString()
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function classifyPanel(el){

  const id = el.id || "";
  const cls = typeof el.className === "string" ? el.className : "";
  const text = String(el.innerText || "")
    .trim()
    .replace(/\s+/g," ")
    .slice(0,240);

  const key = (id + " " + cls + " " + text).toLowerCase();

  if(
    key.includes("globe") ||
    key.includes("global") ||
    key.includes("home") ||
    key.includes("founder") ||
    key.includes("executive") ||
    key.includes("intelligence") ||
    key.includes("command") ||
    key.includes("search")
  ){
    return "KEEP_HOME";
  }

  if(
    key.includes("city") ||
    key.includes("target") ||
    key.includes("map") ||
    key.includes("saturation")
  ){
    return "MOVE_TO_CITY";
  }

  if(
    key.includes("dossier") ||
    key.includes("entity") ||
    key.includes("relationship") ||
    key.includes("source") ||
    key.includes("evidence")
  ){
    return "MOVE_TO_DOSSIER";
  }

  if(
    key.includes("operation") ||
    key.includes("mission") ||
    key.includes("task") ||
    key.includes("watchlist") ||
    key.includes("alert") ||
    key.includes("queue")
  ){
    return "MOVE_TO_OPERATIONS";
  }

  if(
    key.includes("automation") ||
    key.includes("autonomous") ||
    key.includes("workflow") ||
    key.includes("orchestration")
  ){
    return "MOVE_TO_OPERATIONS";
  }

  if(
    key.includes("governance") ||
    key.includes("audit") ||
    key.includes("certification") ||
    key.includes("runtime") ||
    key.includes("lock") ||
    key.includes("health")
  ){
    return "MOVE_TO_GOVERNANCE";
  }

  if(
    key.includes("debug") ||
    key.includes("test") ||
    key.includes("placeholder")
  ){
    return "DELETE_OR_HIDE";
  }

  return "REVIEW_MANUALLY";

}

function purposeFor(action){

  if(action === "KEEP_HOME"){
    return "Supports the primary Globe Hub experience.";
  }

  if(action === "MOVE_TO_CITY"){
    return "Belongs to City / Target View.";
  }

  if(action === "MOVE_TO_DOSSIER"){
    return "Belongs to Entity Dossier View.";
  }

  if(action === "MOVE_TO_OPERATIONS"){
    return "Belongs to Operations / Automation View.";
  }

  if(action === "MOVE_TO_GOVERNANCE"){
    return "Belongs to Governance / Runtime Audit View.";
  }

  if(action === "DELETE_OR_HIDE"){
    return "Likely non-product/debug/placeholder UI.";
  }

  return "Needs human ownership decision.";
}

function isVisiblePanel(el){

  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);

  if(
    r.width < 80 ||
    r.height < 60 ||
    s.display === "none" ||
    s.visibility === "hidden" ||
    s.opacity === "0"
  ){
    return false;
  }

  const tag = el.tagName.toLowerCase();

  if(tag === "html" || tag === "body" || tag === "script" || tag === "style"){
    return false;
  }

  return true;
}

function auditPanels(){

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const viewportArea = vw * vh;

  const panels = Array.from(document.querySelectorAll("*"))
    .filter(isVisiblePanel)
    .map(function(el,index){

      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const action = classifyPanel(el);

      return {
        index,
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        className: typeof el.className === "string"
          ? el.className.slice(0,140)
          : "",
        action,
        purpose: purposeFor(action),
        text: String(el.innerText || "")
          .trim()
          .replace(/\s+/g," ")
          .slice(0,180),
        x: Math.round(r.left),
        y: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
        areaPct: Number((((r.width * r.height) / viewportArea) * 100).toFixed(2)),
        position: s.position,
        zIndex: s.zIndex
      };

    })
    .sort(function(a,b){
      return b.areaPct - a.areaPct;
    });

  const byAction = panels.reduce(function(acc,item){
    acc[item.action] = acc[item.action] || {
      count: 0,
      areaPct: 0
    };

    acc[item.action].count += 1;
    acc[item.action].areaPct += item.areaPct;

    return acc;
  },{});

  Object.keys(byAction).forEach(function(key){
    byAction[key].areaPct = Number(byAction[key].areaPct.toFixed(2));
  });

  const report = {
    module: MODULE_ID,
    phase: "UX_D1",
    timestamp: new Date().toISOString(),
    viewport: {
      width: vw,
      height: vh
    },
    summary: {
      totalVisiblePanels: panels.length,
      byAction,
      keepHomeCount: panels.filter(function(p){ return p.action === "KEEP_HOME"; }).length,
      moveCount: panels.filter(function(p){ return p.action.indexOf("MOVE_TO_") === 0; }).length,
      manualReviewCount: panels.filter(function(p){ return p.action === "REVIEW_MANUALLY"; }).length,
      deleteOrHideCount: panels.filter(function(p){ return p.action === "DELETE_OR_HIDE"; }).length
    },
    diagnosis: {
      homeVisuallyOverloaded:
        panels.filter(function(p){ return p.action !== "KEEP_HOME"; }).length > 5,
      needsManualOwnershipReview:
        panels.filter(function(p){ return p.action === "REVIEW_MANUALLY"; }).length > 0,
      readyForHomeViewIsolation:
        true,
      destructiveChangesMade:
        false
    },
    panels,
    keepHome: panels.filter(function(p){ return p.action === "KEEP_HOME"; }),
    moveToCity: panels.filter(function(p){ return p.action === "MOVE_TO_CITY"; }),
    moveToDossier: panels.filter(function(p){ return p.action === "MOVE_TO_DOSSIER"; }),
    moveToOperations: panels.filter(function(p){ return p.action === "MOVE_TO_OPERATIONS"; }),
    moveToGovernance: panels.filter(function(p){ return p.action === "MOVE_TO_GOVERNANCE"; }),
    manualReview: panels.filter(function(p){ return p.action === "REVIEW_MANUALLY"; }),
    deleteOrHide: panels.filter(function(p){ return p.action === "DELETE_OR_HIDE"; })
  };

  state.lastAudit = clone(report);

  console.group("NEXUS UX VISIBLE PANEL OWNERSHIP D1");
  console.log("Summary:", report.summary);
  console.log("Diagnosis:", report.diagnosis);
  console.table(panels.slice(0,80));
  console.groupEnd();

  return clone(report);

}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_D1",
    status: state.status,
    mode: state.mode,
    hasLastAudit: !!state.lastAudit,
    lastDiagnosis: state.lastAudit
      ? state.lastAudit.diagnosis
      : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXVisiblePanelOwnershipD1 = {
  id: MODULE_ID,
  phase: "UX_D1",
  auditPanels,
  getState
};

console.log(MODULE_ID,getState());

})();
