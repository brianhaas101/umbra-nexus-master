(function () {
  "use strict";

  const G = window.UmbraSessionSecurity = window.UmbraSessionSecurity || {};

  const STORAGE_KEY = "umbra_secure_runtime_session_v1";

  const DEFAULT_CLIENT_ID = "black_dragon";
  const ROLE_FOUNDER = "FOUNDER";
  const ROLE_CLIENT = "CLIENT_OPERATOR";

  const DEFAULT_POLICY = {
    allowed_runtime_roles: ["FOUNDER", "CLIENT_OPERATOR"],
    allowed_client_ids: ["black_dragon"],
    stale_session_rules: {
      stale_after_minutes: 720,
      client_stale_session_resets_to_safe_client_runtime: true,
      founder_stale_session_requires_revalidation: true
    }
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function getActiveUser() {
    try {
      if (window.UmbraUsers && typeof window.UmbraUsers.getActiveUser === "function") {
        return window.UmbraUsers.getActiveUser();
      }
    } catch (err) {}

    return null;
  }

  function detectRole() {
    const user = getActiveUser();

    if (!user) return ROLE_CLIENT;

    const role = String(
      user.role ||
      user.runtime_role ||
      user.account_role ||
      ""
    ).toUpperCase();

    if (role.includes("FOUNDER")) return ROLE_FOUNDER;

    return ROLE_CLIENT;
  }

  function detectClientId() {
    const user = getActiveUser();

    return (
      user &&
      (
        user.client_id ||
        user.clientId ||
        user.active_client ||
        user.activeClient
      )
    ) || DEFAULT_CLIENT_ID;
  }

  function normalizeSession(raw) {
    const role =
      DEFAULT_POLICY.allowed_runtime_roles.includes(raw.runtime_role)
        ? raw.runtime_role
        : ROLE_CLIENT;

    const clientId =
      DEFAULT_POLICY.allowed_client_ids.includes(raw.active_client_id)
        ? raw.active_client_id
        : DEFAULT_CLIENT_ID;

    const sessionScope =
      role === ROLE_FOUNDER
        ? "FOUNDER_RUNTIME"
        : `CLIENT:${clientId}`;

    return {
      active_user_id: raw.active_user_id || null,
      active_client_id: clientId,
      runtime_role: role,
      session_scope: sessionScope,
      session_started_at: raw.session_started_at || nowIso(),
      last_validated_at: nowIso()
    };
  }

  function saveSession(session) {
    const safe = normalizeSession(session || {});

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch (err) {}

    G.current_session = safe;

    return safe;
  }

  function loadSession() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) return null;

      return normalizeSession(JSON.parse(raw));
    } catch (err) {
      return null;
    }
  }

  function sessionAgeMinutes(session) {
    if (!session || !session.last_validated_at) return Infinity;

    const t = Date.parse(session.last_validated_at);

    if (!Number.isFinite(t)) return Infinity;

    return (Date.now() - t) / 60000;
  }

  function isStale(session) {
    return sessionAgeMinutes(session) >
      DEFAULT_POLICY.stale_session_rules.stale_after_minutes;
  }

  function safeClientSession() {
    return {
      active_user_id: null,
      active_client_id: DEFAULT_CLIENT_ID,
      runtime_role: ROLE_CLIENT,
      session_scope: `CLIENT:${DEFAULT_CLIENT_ID}`,
      session_started_at: nowIso(),
      last_validated_at: nowIso()
    };
  }

  function restoreSession() {
    const stored = loadSession();
    const detectedRole = detectRole();
    const detectedClientId = detectClientId();

    let session = stored || {
      active_user_id: null,
      active_client_id: detectedClientId,
      runtime_role: detectedRole,
      session_scope:
        detectedRole === ROLE_FOUNDER
          ? "FOUNDER_RUNTIME"
          : `CLIENT:${detectedClientId}`,
      session_started_at: nowIso(),
      last_validated_at: nowIso()
    };

    if (isStale(session)) {
      if (session.runtime_role === ROLE_FOUNDER) {
        session = safeClientSession();
      } else {
        session = safeClientSession();
      }
    }

    if (session.runtime_role !== ROLE_FOUNDER) {
      session.active_client_id = DEFAULT_CLIENT_ID;
      session.session_scope = `CLIENT:${DEFAULT_CLIENT_ID}`;
    }

    return saveSession(session);
  }

  function validateSession() {
    const session = restoreSession();

    const validRole =
      DEFAULT_POLICY.allowed_runtime_roles.includes(session.runtime_role);

    const validClient =
      DEFAULT_POLICY.allowed_client_ids.includes(session.active_client_id);

    const validScope =
      session.runtime_role === ROLE_FOUNDER
        ? session.session_scope === "FOUNDER_RUNTIME"
        : session.session_scope === `CLIENT:${session.active_client_id}`;

    const valid = validRole && validClient && validScope;

    if (!valid) {
      return saveSession(safeClientSession());
    }

    session.last_validated_at = nowIso();

    return saveSession(session);
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}

    G.current_session = null;

    return true;
  }

  function getDebugState() {
    const session = G.current_session || loadSession() || safeClientSession();

    return {
      version: "umbra_session_security_v1",
      storage_key: STORAGE_KEY,
      session,
      stale: isStale(session),
      age_minutes: Number(sessionAgeMinutes(session).toFixed(2))
    };
  }

  G.STORAGE_KEY = STORAGE_KEY;
  G.restoreSession = restoreSession;
  G.validateSession = validateSession;
  G.saveSession = saveSession;
  G.loadSession = loadSession;
  G.clearSession = clearSession;
  G.getDebugState = getDebugState;

  const restored = validateSession();

  console.info("[UmbraSessionSecurity] Session guard active.", restored);
})();
