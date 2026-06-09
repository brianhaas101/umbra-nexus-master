(function(){

"use strict";

const MODULE_ID = "NEXUS_UX_HUB_LOADER_PLAN_C5";

const state = {
  module: MODULE_ID,
  phase: "UX_C5",
  status: "ACTIVE",
  mode: "HUB_LOADER_PLAN",
  lastPlan: null,
  createdAt: new Date().toISOString()
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function classify(src){

  const lower = String(src || "").toLowerCase();

  if(lower.includes("vendor") || lower.includes("@vite")){
    return "BOOT_REQUIRED";
  }

  if(
    lower.includes("core.js") ||
    lower.includes("scene.js") ||
    lower.includes("postfx") ||
    lower.includes("textures") ||
    lower.includes("layers") ||
    lower.includes("shader") ||
    lower.includes("nodes") ||
    lower.includes("ui.js")
  ){
    return "BOOT_REQUIRED";
  }

  if(
    lower.includes("founder_dashboard") ||
    lower.includes("command_deck") ||
    lower.includes("intelligence_panel") ||
    lower.includes("scoring") ||
    lower.includes("/intel/") ||
    lower.includes("pipeline") ||
    lower.includes("registry")
  ){
    return "HUB_ALLOWED";
  }

  if(
    lower.includes("city_map") ||
    lower.includes("city_tiles") ||
    lower.includes("city_loader") ||
    lower.includes("city_")
  ){
    return "CITY_ONLY";
  }

  if(
    lower.includes("dossier") ||
    lower.includes("relationship")
  ){
    return "DOSSIER_ONLY";
  }

  if(
    lower.includes("phase7") ||
    lower.includes("mission") ||
    lower.includes("task") ||
    lower.includes("watchlist") ||
    lower.includes("alert") ||
    lower.includes("operations")
  ){
    return "OPERATIONS_ONLY";
  }

  if(
    lower.includes("phase8") ||
    lower.includes("automation") ||
    lower.includes("autonomous") ||
    lower.includes("orchestration")
  ){
    return "AUTOMATION_ONLY";
  }

  if(
    lower.includes("phase9") ||
    lower.includes("governance") ||
    lower.includes("continuity") ||
    lower.includes("audit")
  ){
    return "GOVERNANCE_ONLY";
  }

  if(lower.includes("runtime/ux_")){
    return "UX_AUDIT";
  }

  if(
    lower.includes("runtime/production_lock") ||
    lower.includes("runtime/final") ||
    lower.includes("runtime/cleanup") ||
    lower.includes("runtime/stability")
  ){
    return "CERTIFICATION_RUNTIME";
  }

  return "LEGACY_REVIEW";
}

function actionFor(category){

  if(
    category === "BOOT_REQUIRED" ||
    category === "HUB_ALLOWED" ||
    category === "UX_AUDIT" ||
    category === "CERTIFICATION_RUNTIME"
  ){
    return "HOME_KEEP";
  }

  if(
    category === "CITY_ONLY" ||
    category === "DOSSIER_ONLY" ||
    category === "OPERATIONS_ONLY" ||
    category === "AUTOMATION_ONLY" ||
    category === "GOVERNANCE_ONLY"
  ){
    return "WORKSPACE_LOAD_LATER";
  }

  return "LEGACY_REVIEW";
}

function buildPlan(){

  const scripts =
  Array.from(document.scripts)
    .map(function(script,index){

      const src = script.src || "";
      const category = classify(src);
      const homeAction = actionFor(category);

      return {
        index,
        src,
        name: src.split("/").pop() || "inline",
        category,
        homeAction
      };

    });

  const byAction =
  scripts.reduce(function(acc,item){
    acc[item.homeAction] =
    acc[item.homeAction] || 0;

    acc[item.homeAction] += 1;

    return acc;
  },{});

  const byCategory =
  scripts.reduce(function(acc,item){
    acc[item.category] =
    acc[item.category] || 0;

    acc[item.category] += 1;

    return acc;
  },{});

  const homeKeep =
  scripts.filter(function(item){
    return item.homeAction === "HOME_KEEP";
  });

  const workspaceLoadLater =
  scripts.filter(function(item){
    return item.homeAction === "WORKSPACE_LOAD_LATER";
  });

  const legacyReview =
  scripts.filter(function(item){
    return item.homeAction === "LEGACY_REVIEW";
  });

  const report = {
    module: MODULE_ID,
    phase: "UX_C5",
    timestamp: new Date().toISOString(),
    summary: {
      totalScripts: scripts.length,
      homeKeepCount: homeKeep.length,
      workspaceLoadLaterCount: workspaceLoadLater.length,
      legacyReviewCount: legacyReview.length,
      byAction,
      byCategory
    },
    diagnosis: {
      safeToProceedToLoaderRefactor:
        homeKeep.length > 0 &&
        workspaceLoadLater.length > 0,
      hubTargetScriptCount:
        homeKeep.length,
      scriptsToRemoveFromHomeBoot:
        workspaceLoadLater.length + legacyReview.length,
      destructiveChangesMade:
        false
    },
    homeKeep,
    workspaceLoadLater,
    legacyReview,
    scripts
  };

  state.lastPlan = clone(report);

  console.group("NEXUS UX HUB LOADER PLAN C5");
  console.log("Summary:", report.summary);
  console.log("Diagnosis:", report.diagnosis);
  console.table(homeKeep);
  console.table(workspaceLoadLater.slice(0,100));
  console.table(legacyReview.slice(0,80));
  console.groupEnd();

  return clone(report);
}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_C5",
    status: state.status,
    mode: state.mode,
    hasLastPlan: !!state.lastPlan,
    lastDiagnosis: state.lastPlan
      ? state.lastPlan.diagnosis
      : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXHubLoaderPlanC5 = {
  id: MODULE_ID,
  phase: "UX_C5",
  buildPlan,
  getState
};

console.log(MODULE_ID,getState());

})();
