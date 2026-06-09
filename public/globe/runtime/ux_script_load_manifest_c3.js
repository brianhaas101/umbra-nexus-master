(function(){

"use strict";

const MODULE_ID =
"NEXUS_UX_SCRIPT_LOAD_MANIFEST_C3";

const state = {
  module: MODULE_ID,
  phase: "UX_C3",
  status: "ACTIVE",
  mode: "SCRIPT_LOAD_MANIFEST",
  lastAudit: null,
  createdAt: new Date().toISOString()
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function classify(src){

  const lower =
  String(src || "").toLowerCase();

  if(
    lower.includes("vendor") ||
    lower.includes("@vite")
  ){
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

  if(
    lower.includes("runtime/ux_")
  ){
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

  if(
    lower.includes("phase3") ||
    lower.includes("phase4") ||
    lower.includes("phase5") ||
    lower.includes("phase6")
  ){
    return "LEGACY_REVIEW";
  }

  return "LEGACY_REVIEW";

}

function auditManifest(){

  const scripts =
  Array.from(document.scripts)
    .map(function(script,index){

      const src =
      script.src || "";

      const category =
      classify(src);

      return {
        index,
        src,
        name:
        src.split("/").pop() || "inline",
        category
      };

    });

  const byCategory =
  scripts.reduce(function(acc,item){
    acc[item.category] =
    acc[item.category] || 0;

    acc[item.category] += 1;

    return acc;
  },{});

  const hubAllowed =
  scripts.filter(function(item){
    return (
      item.category === "BOOT_REQUIRED" ||
      item.category === "HUB_ALLOWED" ||
      item.category === "UX_AUDIT" ||
      item.category === "CERTIFICATION_RUNTIME"
    );
  });

  const workspaceScoped =
  scripts.filter(function(item){
    return (
      item.category === "CITY_ONLY" ||
      item.category === "DOSSIER_ONLY" ||
      item.category === "OPERATIONS_ONLY" ||
      item.category === "AUTOMATION_ONLY" ||
      item.category === "GOVERNANCE_ONLY"
    );
  });

  const legacyReview =
  scripts.filter(function(item){
    return item.category === "LEGACY_REVIEW";
  });

  const report = {
    module: MODULE_ID,
    phase: "UX_C3",
    timestamp: new Date().toISOString(),
    summary: {
      totalScripts: scripts.length,
      hubAllowedCount: hubAllowed.length,
      workspaceScopedCount: workspaceScoped.length,
      legacyReviewCount: legacyReview.length,
      byCategory
    },
    diagnosis: {
      currentHubOverloadsWorkspace:
      workspaceScoped.length > 0 || legacyReview.length > 20,

      shouldMoveToWorkspaceLoader:
      workspaceScoped.length,

      shouldReviewLegacy:
      legacyReview.length,

      targetHubScriptCount:
      hubAllowed.length
    },
    hubAllowed,
    workspaceScoped,
    legacyReview,
    scripts
  };

  state.lastAudit =
  clone(report);

  console.group("NEXUS UX SCRIPT LOAD MANIFEST C3");
  console.log("Summary:", report.summary);
  console.log("Diagnosis:", report.diagnosis);
  console.table(workspaceScoped.slice(0,80));
  console.table(legacyReview.slice(0,80));
  console.groupEnd();

  return clone(report);

}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_C3",
    status: state.status,
    mode: state.mode,
    hasLastAudit: !!state.lastAudit,
    lastDiagnosis:
    state.lastAudit
      ? state.lastAudit.diagnosis
      : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXScriptLoadManifestC3 = {
  id: MODULE_ID,
  phase: "UX_C3",
  auditManifest,
  getState
};

console.log(MODULE_ID,getState());

})();
