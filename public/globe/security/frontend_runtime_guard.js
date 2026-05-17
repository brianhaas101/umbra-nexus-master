(function () {
  "use strict";

  const G = window.UmbraFrontendSecurity = window.UmbraFrontendSecurity || {};

  const ROLE_FOUNDER = "FOUNDER";
  const ROLE_CLIENT = "CLIENT_OPERATOR";

  const DEFAULT_POLICY = {
    roles: {
      FOUNDER: {
        allowed_panels: [
          "FOUNDER_ADMIN",
          "CLIENT_SWITCHER",
          "SECURITY_AUDITS",
          "INTEL_REGISTRY",
          "GLOBAL_DATA",
          "BLACK_DRAGON_BOOKS",
          "BLACK_DRAGON_COURSES",
          "ADAPTIVE_PRIORITY",
          "RESPONSE_INGESTION",
          "EXPORTS"
        ],
        blocked_panels: []
      },

      CLIENT_OPERATOR: {
        allowed_panels: [
          "BLACK_DRAGON_BOOKS",
          "OUTREACH_QUEUE",
          "TARGET_VIEW",
          "RESPONSE_LOG",
          "KPI_SUMMARY"
        ],
        blocked_panels: [
          "FOUNDER_ADMIN",
          "CLIENT_SWITCHER",
          "SECURITY_AUDITS",
          "INTEL_REGISTRY",
          "GLOBAL_DATA",
          "SYSTEM_CONFIG",
          "EXPORTS"
        ]
      }
    },

    client_session_rules: {
      client_runtime_scope_required: true,
      client_id_required: true,
      role_required: true,
      founder_role_required_for_admin_panels: true,
      client_operator_cannot_switch_clients: true,
      client_operator_cannot_export_raw_datasets: true
    }
  };

  function getStore() {
    try {
      if (window.UmbraUsers && typeof window.UmbraUsers.getStore === "function") {
        return window.UmbraUsers.getStore();
      }
    } catch (err) {}

    return null;
  }

  function getActiveUser() {
    try {
      if (window.UmbraUsers && typeof window.UmbraUsers.getActiveUser === "function") {
        return window.UmbraUsers.getActiveUser();
      }
    } catch (err) {}

    const store = getStore();

    if (!store || !store.active_user_id || !store.users) {
      return null;
    }

    return store.users[store.active_user_id] || null;
  }

  function getRuntimeRole() {
    const user = getActiveUser();

    if (!user) {
      return ROLE_CLIENT;
    }

    const role =
      user.role ||
      user.runtime_role ||
      user.account_role ||
      null;

    if (String(role).toUpperCase().includes("FOUNDER")) {
      return ROLE_FOUNDER;
    }

    return ROLE_CLIENT;
  }

  function getClientId() {
    const user = getActiveUser();

    return (
      user &&
      (
        user.client_id ||
        user.clientId ||
        user.active_client ||
        user.activeClient
      )
    ) || "black_dragon";
  }

  function getPolicy() {
    return G.policy || DEFAULT_POLICY;
  }

  function canAccessPanel(panelId) {
    const policy = getPolicy();
    const role = getRuntimeRole();

    const rolePolicy =
      policy.roles[role] ||
      policy.roles[ROLE_CLIENT];

    if (!rolePolicy) return false;

    if ((rolePolicy.blocked_panels || []).includes(panelId)) {
      return false;
    }

    return (rolePolicy.allowed_panels || []).includes(panelId);
  }

  function requireFounder(actionName) {
    const role = getRuntimeRole();

    if (role !== ROLE_FOUNDER) {
      console.warn("[UmbraFrontendSecurity] Founder-only action blocked:", actionName);
      return false;
    }

    return true;
  }

  function assertClientScope(clientId) {
    const role = getRuntimeRole();

    if (role === ROLE_FOUNDER) {
      return true;
    }

    const activeClientId = getClientId();

    return String(activeClientId) === String(clientId);
  }

  function canExportDataset(datasetScope) {
    const role = getRuntimeRole();

    if (role === ROLE_FOUNDER) {
      return true;
    }

    console.warn("[UmbraFrontendSecurity] Client dataset export blocked:", datasetScope);
    return false;
  }

  function applyPanelVisibility(root) {
    const scope = root || document;

    const nodes = scope.querySelectorAll("[data-umbra-panel]");

    nodes.forEach((node) => {
      const panelId = node.getAttribute("data-umbra-panel");

      const allowed = canAccessPanel(panelId);

      node.hidden = !allowed;
      node.setAttribute("data-umbra-access", allowed ? "allowed" : "blocked");
    });

    return true;
  }

  function getDebugState() {
    const role = getRuntimeRole();
    const clientId = getClientId();
    const policy = getPolicy();

    return {
      version: "umbra_frontend_runtime_guard_v1",
      role,
      client_id: clientId,
      founder: role === ROLE_FOUNDER,
      client_operator: role === ROLE_CLIENT,
      rules: policy.client_session_rules,
      accessible_panels:
        Object.keys(policy.roles).includes(role)
          ? policy.roles[role].allowed_panels
          : []
    };
  }

  G.ROLE_FOUNDER = ROLE_FOUNDER;
  G.ROLE_CLIENT = ROLE_CLIENT;
  G.DEFAULT_POLICY = DEFAULT_POLICY;

  G.getRuntimeRole = getRuntimeRole;
  G.getClientId = getClientId;
  G.canAccessPanel = canAccessPanel;
  G.requireFounder = requireFounder;
  G.assertClientScope = assertClientScope;
  G.canExportDataset = canExportDataset;
  G.applyPanelVisibility = applyPanelVisibility;
  G.getDebugState = getDebugState;

  console.info("[UmbraFrontendSecurity] Runtime guard loaded.");
})();
