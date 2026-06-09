(function(){

"use strict";

const MODULE_ID =
"NEXUS_UX_VISUAL_PURPOSE_AUDIT_B0";

const state = {

  module:
  MODULE_ID,

  phase:
  "UX_B0",

  status:
  "ACTIVE",

  mode:
  "VISUAL_PURPOSE_AUDIT",

  lastAudit:
  null,

  auditHistory:
  [],

  events:
  [],

  createdAt:
  new Date().toISOString()

};

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function emit(type,payload = {}){

  const event = {
    type,
    payload,
    timestamp:
    new Date().toISOString()
  };

  state.events.push(event);

  if(state.events.length > 300){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:ux-purpose-audit:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function classifyElement(el){

  const id =
  el.id || "";

  const cls =
  typeof el.className === "string"
    ? el.className
    : "";

  const text =
  String(el.innerText || "")
    .trim()
    .slice(0,120);

  const key =
  (
    id + " " + cls + " " + text
  ).toLowerCase();

  if(
    key.includes("nav") ||
    key.includes("command") ||
    key.includes("overview") ||
    key.includes("dossier") ||
    key.includes("operation") ||
    key.includes("intelligence")
  ){
    return "NAVIGATION_OR_WORKSPACE_CONTROL";
  }

  if(
    key.includes("globe") ||
    key.includes("canvas") ||
    key.includes("map") ||
    key.includes("stage") ||
    key.includes("surface")
  ){
    return "PRIMARY_WORKSPACE_SURFACE";
  }

  if(
    key.includes("health") ||
    key.includes("status") ||
    key.includes("alert") ||
    key.includes("feed") ||
    key.includes("activity")
  ){
    return "CONTEXT_OR_STATUS";
  }

  if(
    key.includes("profile") ||
    key.includes("account") ||
    key.includes("settings") ||
    key.includes("phase")
  ){
    return "UTILITY_OR_META";
  }

  if(
    key.includes("saturation") ||
    key.includes("queue") ||
    key.includes("review") ||
    key.includes("entities") ||
    key.includes("metrics")
  ){
    return "OPERATIONAL_DATA";
  }

  return "UNCLASSIFIED";

}

function inferDecisionSupport(type){

  if(type === "PRIMARY_WORKSPACE_SURFACE"){
    return "Supports spatial/global situational awareness.";
  }

  if(type === "NAVIGATION_OR_WORKSPACE_CONTROL"){
    return "Supports movement between workspaces or modes.";
  }

  if(type === "CONTEXT_OR_STATUS"){
    return "Supports awareness of system condition, alerts, or activity.";
  }

  if(type === "OPERATIONAL_DATA"){
    return "Supports operational prioritization or review.";
  }

  if(type === "UTILITY_OR_META"){
    return "Supports account, profile, release, or environment awareness.";
  }

  return "Decision support unclear.";

}

function recommendAction(type,areaPct,text){

  if(type === "UNCLASSIFIED"){
    return "AUDIT_REQUIRED";
  }

  if(
    type === "UTILITY_OR_META" &&
    areaPct > 5
  ){
    return "COLLAPSE_OR_MOVE_TO_HEADER";
  }

  if(
    type === "NAVIGATION_OR_WORKSPACE_CONTROL" &&
    areaPct > 12
  ){
    return "CONSOLIDATE_NAVIGATION";
  }

  if(
    type === "OPERATIONAL_DATA" &&
    areaPct > 18
  ){
    return "MOVE_TO_WORKSPACE_OR_COLLAPSE";
  }

  if(
    !text &&
    type !== "PRIMARY_WORKSPACE_SURFACE"
  ){
    return "CHECK_EMPTY_VISIBLE_CONTAINER";
  }

  return "KEEP_FOR_NOW";

}

function visibleLargeElements(){

  const vw =
  window.innerWidth;

  const vh =
  window.innerHeight;

  const viewportArea =
  vw * vh;

  return Array.from(
    document.querySelectorAll("*")
  )
  .map(function(el){

    const rect =
    el.getBoundingClientRect();

    const style =
    getComputedStyle(el);

    if(
      rect.width <= 50 ||
      rect.height <= 50 ||
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ){
      return null;
    }

    const type =
    classifyElement(el);

    const text =
    String(el.innerText || "")
      .trim()
      .replace(/\s+/g," ")
      .slice(0,120);

    const areaPct =
    Number(
      (
        (
          rect.width * rect.height
        ) / viewportArea * 100
      ).toFixed(2)
    );

    return {

      tag:
      el.tagName.toLowerCase(),

      id:
      el.id || "",

      className:
      typeof el.className === "string"
        ? el.className.slice(0,100)
        : "",

      type:
      type,

      purpose:
      inferDecisionSupport(type),

      recommendation:
      recommendAction(
        type,
        areaPct,
        text
      ),

      text:
      text,

      x:
      Math.round(rect.left),

      y:
      Math.round(rect.top),

      width:
      Math.round(rect.width),

      height:
      Math.round(rect.height),

      areaPct:
      areaPct,

      position:
      style.position,

      zIndex:
      style.zIndex

    };

  })
  .filter(Boolean)
  .sort(function(a,b){
    return b.areaPct - a.areaPct;
  });

}

function summarize(elements){

  const summary = {

    totalVisibleLargeElements:
    elements.length,

    byType:
    {},

    byRecommendation:
    {},

    unclassified:
    0,

    auditRequired:
    0,

    largest:
    elements.slice(0,15)

  };

  elements.forEach(function(item){

    summary.byType[item.type] =
    summary.byType[item.type] || {
      count:
      0,

      areaPct:
      0
    };

    summary.byType[item.type].count += 1;
    summary.byType[item.type].areaPct += item.areaPct;

    summary.byRecommendation[item.recommendation] =
    summary.byRecommendation[item.recommendation] || 0;

    summary.byRecommendation[item.recommendation] += 1;

    if(item.type === "UNCLASSIFIED"){
      summary.unclassified += 1;
    }

    if(item.recommendation === "AUDIT_REQUIRED"){
      summary.auditRequired += 1;
    }

  });

  Object.keys(summary.byType).forEach(function(key){
    summary.byType[key].areaPct =
    Number(
      summary.byType[key].areaPct.toFixed(2)
    );
  });

  return summary;

}

function runAudit(){

  const elements =
  visibleLargeElements();

  const summary =
  summarize(elements);

  const report = {

    module:
    MODULE_ID,

    phase:
    "UX_B0",

    viewport:
    {
      width:
      window.innerWidth,

      height:
      window.innerHeight
    },

    summary:
    summary,

    elements:
    elements,

    timestamp:
    new Date().toISOString()

  };

  state.lastAudit =
  clone(report);

  state.auditHistory.push(
    clone(report)
  );

  if(state.auditHistory.length > 20){
    state.auditHistory.shift();
  }

  console.group(
    "NEXUS UX VISUAL PURPOSE AUDIT B0"
  );

  console.log(
    "Viewport:",
    report.viewport
  );

  console.log(
    "Summary:",
    summary
  );

  console.table(
    elements.slice(0,30)
  );

  console.groupEnd();

  emit(
    "UX_VISUAL_PURPOSE_AUDIT_COMPLETED",
    {
      summary:
      summary
    }
  );

  return clone(report);

}

function getLastAudit(){
  return clone(state.lastAudit);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    phase:
    "UX_B0",

    status:
    state.status,

    mode:
    state.mode,

    hasLastAudit:
    !!state.lastAudit,

    auditHistoryCount:
    state.auditHistory.length,

    lastSummary:
    state.lastAudit
      ? state.lastAudit.summary
      : null,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraUXVisualPurposeAuditB0 = {

  id:
  MODULE_ID,

  phase:
  "UX_B0",

  runAudit,

  visibleLargeElements,

  getLastAudit,

  getState

};

console.log(
  MODULE_ID,
  getState()
);

})();
