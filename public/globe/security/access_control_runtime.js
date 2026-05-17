(function () {
  "use strict";

  const G = window.UmbraAccessControl =
    window.UmbraAccessControl || {};

  const CLIENT_PROFILE_URL =
    "/data/clients/black_dragon/access/client_access_profile.v1.json";

  const FOUNDER_PROFILE_URL =
    "/data/security/platform/founder_access_profile.v1.json";

  let state = {
    loaded: false,
    active_user: null,
    active_role: null,
    active_client: null,
    client_profile: null,
    founder_profile: null,
    last_denial: null,
    last_error: null
  };

  function getActiveUserId() {
    try {
      return (
        window.UmbraUsers?.getActiveUserId?.() ||
        window.UmbraUsers?.getStore?.()?.active_user ||
        window.UMBRA_ACTIVE_USER ||
        "founder_001"
      );
    } catch (err) {
      return "founder_001";
    }
  }

  function inferRole(userId) {
    if (String(userId) === "founder_001") return "FOUNDER";
    if (String(userId).includes("black_dragon")) return "CLIENT";
    return "CLIENT";
  }

  async function load() {
    try {
      const [clientRes, founderRes] = await Promise.all([
        fetch(CLIENT_PROFILE_URL),
        fetch(FOUNDER_PROFILE_URL)
      ]);

      state.client_profile = await clientRes.json();
      state.founder_profile = await founderRes.json();

      state.active_user = getActiveUserId();
      state.active_role = inferRole(state.active_user);
      state.active_client =
        state.active_role === "CLIENT" ? "black_dragon" : null;

      state.loaded = true;
      state.last_error = null;

      applyRuntimeGuards();

      return getDebugState();
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return getDebugState();
    }
  }

  function getProfile() {
    return state.active_role === "FOUNDER"
      ? state.founder_profile
      : state.client_profile;
  }

  function deny(action, reason) {
    state.last_denial = {
      action,
      reason,
      at: new Date().toISOString()
    };

    console.warn("[UmbraAccessControl] denied", state.last_denial);

    return false;
  }

  function can(action) {
    const profile = getProfile();

    if (!profile) return false;

    if (
      Array.isArray(profile.blocked_actions) &&
      profile.blocked_actions.includes(action)
    ) {
      return deny(action, "blocked_action");
    }

    if (
      Array.isArray(profile.allowed_actions) &&
      profile.allowed_actions.includes(action)
    ) {
      return true;
    }

    if (state.active_role === "FOUNDER") return true;

    return deny(action, "not_allowed_for_client_profile");
  }

  function canView(view) {
    const profile = getProfile();

    if (!profile) return false;

    if (
      Array.isArray(profile.blocked_views) &&
      profile.blocked_views.includes(view)
    ) {
      return deny("view:" + view, "blocked_view");
    }

    if (
      Array.isArray(profile.allowed_views) &&
      profile.allowed_views.includes(view)
    ) {
      return true;
    }

    if (state.active_role === "FOUNDER") return true;

    return deny("view:" + view, "not_allowed_view");
  }

  function requireClientScope(record) {
    if (state.active_role === "FOUNDER") return true;

    const clientId =
      record?.client_id ||
      record?.client ||
      record?.data_scope?.client_id ||
      null;

    if (clientId === "black_dragon") return true;

    return deny("client_scope", "cross_client_access_blocked");
  }

  function applyRuntimeGuards() {
    try {
      window.UMBRA_ACCESS_ROLE = state.active_role;
      window.UMBRA_ACCESS_CLIENT =
        state.active_role === "CLIENT" ? "black_dragon" : null;
    } catch (err) {}

    if (state.active_role !== "CLIENT") return true;

    try {
      if (window.UmbraUsers && !window.UmbraUsers.__accessGuarded) {
        window.UmbraUsers.__accessGuarded = true;

        const originalSwitch =
          window.UmbraUsers.switchUser;

        if (typeof originalSwitch === "function") {
          window.UmbraUsers.switchUser = function (userId) {
            if (String(userId) === "founder_001") {
              return deny("switch_to_founder", "client_cannot_switch_to_founder");
            }

            return originalSwitch.apply(window.UmbraUsers, arguments);
          };
        }
      }
    } catch (err) {}

    return true;
  }

  function setActiveRoleForTest(role) {
    if (role !== "FOUNDER" && role !== "CLIENT") return false;
    state.active_role = role;
    state.active_client = role === "CLIENT" ? "black_dragon" : null;
    applyRuntimeGuards();
    return true;
  }

  function getDebugState() {
    return {
      version: "umbra_access_control_v1_batch_085",
      loaded: state.loaded,
      active_user: state.active_user,
      active_role: state.active_role,
      active_client: state.active_client,
      client_profile_loaded: !!state.client_profile,
      founder_profile_loaded: !!state.founder_profile,
      last_denial: state.last_denial,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.can = can;
  G.canView = canView;
  G.requireClientScope = requireClientScope;
  G.applyRuntimeGuards = applyRuntimeGuards;
  G.setActiveRoleForTest = setActiveRoleForTest;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(load, 1500);
  });

  if (document.readyState !== "loading") {
    setTimeout(load, 1500);
  }
})();
