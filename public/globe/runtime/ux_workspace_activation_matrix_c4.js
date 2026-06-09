(function(){

"use strict";

const MODULE_ID = "NEXUS_UX_WORKSPACE_ACTIVATION_MATRIX_C4";

const MATRIX = {
  HOME_CENTER: {
    purpose: "Global Globe Hub",
    allowedCategories: [
      "BOOT_REQUIRED",
      "HUB_ALLOWED",
      "UX_AUDIT",
      "CERTIFICATION_RUNTIME"
    ],
    hiddenCategories: [
      "CITY_ONLY",
      "DOSSIER_ONLY",
      "OPERATIONS_ONLY",
      "AUTOMATION_ONLY",
      "GOVERNANCE_ONLY",
      "LEGACY_REVIEW"
    ]
  },

  CITY_CENTER: {
    purpose: "City / Target View",
    allowedCategories: [
      "BOOT_REQUIRED",
      "CITY_ONLY",
      "HUB_ALLOWED"
    ],
    hiddenCategories: [
      "DOSSIER_ONLY",
      "OPERATIONS_ONLY",
      "AUTOMATION_ONLY",
      "GOVERNANCE_ONLY",
      "LEGACY_REVIEW"
    ]
  },

  DOSSIER_CENTER: {
    purpose: "Entity Dossier View",
    allowedCategories: [
      "BOOT_REQUIRED",
      "DOSSIER_ONLY",
      "HUB_ALLOWED"
    ],
    hiddenCategories: [
      "CITY_ONLY",
      "OPERATIONS_ONLY",
      "AUTOMATION_ONLY",
      "GOVERNANCE_ONLY",
      "LEGACY_REVIEW"
    ]
  },

  OPERATIONS_CENTER: {
    purpose: "Operations Execution View",
    allowedCategories: [
      "BOOT_REQUIRED",
      "OPERATIONS_ONLY",
      "AUTOMATION_ONLY",
      "HUB_ALLOWED"
    ],
    hiddenCategories: [
      "CITY_ONLY",
      "DOSSIER_ONLY",
      "GOVERNANCE_ONLY",
      "LEGACY_REVIEW"
    ]
  },

  GOVERNANCE_CENTER: {
    purpose: "Governance / Audit View",
    allowedCategories: [
      "BOOT_REQUIRED",
      "GOVERNANCE_ONLY",
      "CERTIFICATION_RUNTIME",
      "UX_AUDIT"
    ],
    hiddenCategories: [
      "CITY_ONLY",
      "DOSSIER_ONLY",
      "OPERATIONS_ONLY",
      "AUTOMATION_ONLY",
      "LEGACY_REVIEW"
    ]
  }
};

const state = {
  module: MODULE_ID,
  phase: "UX_C4",
  status: "ACTIVE",
  mode: "WORKSPACE_ACTIVATION_MATRIX",
  activeCenter: "HOME_CENTER",
  lastEvaluation: null,
  history: [],
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

function getScripts(){

  return Array.from(document.scripts)
    .map(function(script,index){

      const src = script.src || "";
      const category = classify(src);

      return {
        index,
        src,
        name: src.split("/").pop() || "inline",
        category
      };

    });

}

function evaluateCenter(center){

  const target =
  center || state.activeCenter || "HOME_CENTER";

  const config =
  MATRIX[target] || MATRIX.HOME_CENTER;

  const scripts =
  getScripts();

  const allowed =
  scripts.filter(function(item){
    return config.allowedCategories.includes(item.category);
  });

  const shouldBeHidden =
  scripts.filter(function(item){
    return config.hiddenCategories.includes(item.category);
  });

  const unknown =
  scripts.filter(function(item){
    return (
      !config.allowedCategories.includes(item.category) &&
      !config.hiddenCategories.includes(item.category)
    );
  });

  const report = {
    module: MODULE_ID,
    phase: "UX_C4",
    center: target,
    purpose: config.purpose,
    timestamp: new Date().toISOString(),
    totalScripts: scripts.length,
    allowedCount: allowed.length,
    shouldBeHiddenCount: shouldBeHidden.length,
    unknownCount: unknown.length,
    allowedCategories: config.allowedCategories,
    hiddenCategories: config.hiddenCategories,
    allowed,
    shouldBeHidden,
    unknown,
    diagnosis: {
      centerOverloaded: shouldBeHidden.length > 0,
      legacyPresent: shouldBeHidden.some(function(item){
        return item.category === "LEGACY_REVIEW";
      }),
      readyForLoaderRefactor: true
    }
  };

  state.lastEvaluation = clone(report);
  state.history.push(clone(report));

  if(state.history.length > 20){
    state.history.shift();
  }

  console.group("NEXUS UX WORKSPACE ACTIVATION MATRIX C4");
  console.log("Center:", target);
  console.log("Purpose:", config.purpose);
  console.log("Diagnosis:", report.diagnosis);
  console.log("Counts:", {
    totalScripts: report.totalScripts,
    allowedCount: report.allowedCount,
    shouldBeHiddenCount: report.shouldBeHiddenCount,
    unknownCount: report.unknownCount
  });
  console.table(shouldBeHidden.slice(0,80));
  console.groupEnd();

  return clone(report);

}

function setActiveCenter(center){

  if(!MATRIX[center]){
    return {
      ok: false,
      reason: "UNKNOWN_CENTER",
      center
    };
  }

  state.activeCenter = center;

  return {
    ok: true,
    activeCenter: center,
    evaluation: evaluateCenter(center)
  };

}

function getMatrix(){
  return clone(MATRIX);
}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_C4",
    status: state.status,
    mode: state.mode,
    activeCenter: state.activeCenter,
    hasLastEvaluation: !!state.lastEvaluation,
    historyCount: state.history.length,
    lastDiagnosis: state.lastEvaluation
      ? state.lastEvaluation.diagnosis
      : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXWorkspaceActivationMatrixC4 = {
  id: MODULE_ID,
  phase: "UX_C4",
  getMatrix,
  evaluateCenter,
  setActiveCenter,
  getState
};

console.log(MODULE_ID,getState());

})();
