(function () {
  "use strict";

  const G = window.UmbraUIPanelSecurity = window.UmbraUIPanelSecurity || {};

  const PANEL_SELECTORS = [
    { selector: "[data-founder-only]", panel: "FOUNDER_ADMIN" },
    { selector: "[data-client-switcher]", panel: "CLIENT_SWITCHER" },
    { selector: "[data-security-audits]", panel: "SECURITY_AUDITS" },
    { selector: "[data-intel-registry]", panel: "INTEL_REGISTRY" },
    { selector: "[data-global-data]", panel: "GLOBAL_DATA" },
    { selector: "[data-system-config]", panel: "SYSTEM_CONFIG" },
    { selector: "[data-export-control]", panel: "EXPORTS" },

    { selector: "[data-black-dragon-books]", panel: "BLACK_DRAGON_BOOKS" },
    { selector: "[data-outreach-queue]", panel: "OUTREACH_QUEUE" },
    { selector: "[data-target-view]", panel: "TARGET_VIEW" },
    { selector: "[data-response-log]", panel: "RESPONSE_LOG" },
    { selector: "[data-kpi-summary]", panel: "KPI_SUMMARY" }
  ];

  function getGuard() {
    return window.UmbraFrontendSecurity || null;
  }

  function canAccess(panelId) {
    const guard = getGuard();

    if (!guard || typeof guard.canAccessPanel !== "function") {
      return false;
    }

    return guard.canAccessPanel(panelId);
  }

  function suppressNode(node, panelId, allowed) {
    node.hidden = !allowed;
    node.setAttribute("data-umbra-panel", panelId);
    node.setAttribute("data-umbra-access", allowed ? "allowed" : "blocked");

    if (!allowed) {
      node.setAttribute("aria-hidden", "true");
      node.classList.add("umbra-panel-blocked");
    } else {
      node.removeAttribute("aria-hidden");
      node.classList.remove("umbra-panel-blocked");
    }
  }

  function applySecurity(root) {
    const scope = root || document;

    PANEL_SELECTORS.forEach(rule => {
      const nodes = scope.querySelectorAll(rule.selector);

      nodes.forEach(node => {
        const allowed = canAccess(rule.panel);
        suppressNode(node, rule.panel, allowed);
      });
    });

    if (
      window.UmbraFrontendSecurity &&
      typeof window.UmbraFrontendSecurity.applyPanelVisibility === "function"
    ) {
      window.UmbraFrontendSecurity.applyPanelVisibility(scope);
    }

    return getDebugState();
  }

  function getDebugState() {
    const guard = getGuard();

    const role =
      guard && typeof guard.getRuntimeRole === "function"
        ? guard.getRuntimeRole()
        : "UNKNOWN";

    const clientId =
      guard && typeof guard.getClientId === "function"
        ? guard.getClientId()
        : "UNKNOWN";

    const blocked =
      Array.from(document.querySelectorAll("[data-umbra-access='blocked']")).length;

    const allowed =
      Array.from(document.querySelectorAll("[data-umbra-access='allowed']")).length;

    return {
      version: "umbra_ui_panel_security_v1",
      role,
      client_id: clientId,
      allowed_panels: allowed,
      blocked_panels: blocked,
      hook_active: true
    };
  }

  function boot() {
    applySecurity(document);

    const observer = new MutationObserver(() => {
      applySecurity(document);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    G._observer = observer;

    console.info("[UmbraUIPanelSecurity] Panel security hook active.", getDebugState());
  }

  G.PANEL_SELECTORS = PANEL_SELECTORS;
  G.applySecurity = applySecurity;
  G.getDebugState = getDebugState;
  G.boot = boot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
