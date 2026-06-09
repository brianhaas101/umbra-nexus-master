(function(){

"use strict";

const MODULE_ID = "NEXUS_PANEL_OWNERSHIP_REGISTRY_D4B";

const OWNERSHIP = {
  globe: {
    owner: "globe/core.js",
    purpose: "Primary spatial navigation surface"
  },

  reviewQueue: {
    owner: "phase6_priority_queue_workspace",
    purpose: "Shows operator work requiring review"
  },

  recentActivity: {
    owner: "phase5_activity_review_feed",
    purpose: "Shows recent intelligence/runtime changes"
  },

  topTargets: {
    owner: "founder_dashboard_runtime",
    purpose: "Shows highest-priority scored entities"
  },

  quickActions: {
    owner: "command_deck_runtime",
    purpose: "Launches common operator actions"
  },

  runtime: {
    owner: "governance_runtime_integration_500",
    purpose: "Shows live runtime state"
  },

  validation: {
    owner: "production_lock_504",
    purpose: "Shows validation readiness"
  },

  coverage: {
    owner: "intelligence_panel_live_state",
    purpose: "Shows cities/entities/sources coverage"
  },

  pipeline: {
    owner: "intel/pipeline.js",
    purpose: "Shows intelligence pipeline state"
  },

  alerts: {
    owner: "automation_operations_integration_499",
    purpose: "Shows active alerts and operator warnings"
  }
};

const state = {
  module: MODULE_ID,
  phase: "UX_D4B",
  status: "ACTIVE",
  mode: "PANEL_OWNERSHIP_REGISTRY",
  createdAt: new Date().toISOString()
};

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function getOwnership(){
  return clone(OWNERSHIP);
}

function inspectPanel(panelName){
  return clone(
    OWNERSHIP[panelName] || {
      owner: null,
      purpose: null,
      missing: true
    }
  );
}

function validateHomeOwnership(){

  const home =
    window.UmbraHomeViewRegistryD4A
      ? window.UmbraHomeViewRegistryD4A.getAllowedPanels()
      : [];

  const missing =
    home.filter(function(panel){
      return !OWNERSHIP[panel] &&
        ![
          "brand",
          "executiveCommand",
          "profile",
          "account",
          "command",
          "intelligence",
          "dossiers",
          "operations",
          "automation",
          "governance",
          "settings",
          "cityLabels",
          "entityLabels",
          "signalRoutes",
          "home",
          "cityView",
          "dashboard"
        ].includes(panel);
    });

  return {
    module: MODULE_ID,
    phase: "UX_D4B",
    checked: home.length,
    missingOwnership: missing,
    passing: missing.length === 0
  };
}

function getState(){
  return clone(state);
}

window.UmbraPanelOwnershipRegistryD4B = {
  id: MODULE_ID,
  phase: "UX_D4B",
  getOwnership,
  inspectPanel,
  validateHomeOwnership,
  getState
};

console.log(MODULE_ID,getState());

})();
