(function () {
  "use strict";

  const G = window.UmbraDatasetSecurity = window.UmbraDatasetSecurity || {};

  const ROLE_FOUNDER = "FOUNDER";
  const ROLE_CLIENT = "CLIENT_OPERATOR";

  const DEFAULT_CLIENT_ROOT =
    "public/data/clients/black_dragon";

  const RESTRICTED_ROOTS = [
    "public/data/security",
    "public/data/intelligence",
    "public/data/global",
    "public/data/founder",
    "public/data/system"
  ];

  function getFrontendSecurity() {
    return window.UmbraFrontendSecurity || null;
  }

  function getRuntimeRole() {
    const sec = getFrontendSecurity();

    if (!sec || typeof sec.getRuntimeRole !== "function") {
      return ROLE_CLIENT;
    }

    return sec.getRuntimeRole();
  }

  function getClientId() {
    const sec = getFrontendSecurity();

    if (!sec || typeof sec.getClientId !== "function") {
      return "black_dragon";
    }

    return sec.getClientId();
  }

  function normalize(path) {
    return String(path || "")
      .replace(/\\/g, "/")
      .trim();
  }

  function isRestricted(path) {
    const p = normalize(path);

    return RESTRICTED_ROOTS.some(root =>
      p.startsWith(normalize(root))
    );
  }

  function isClientScoped(path) {
    const p = normalize(path);

    return p.startsWith(DEFAULT_CLIENT_ROOT);
  }

  function canAccessDataset(path) {

    const role = getRuntimeRole();
    const p = normalize(path);

    if (role === ROLE_FOUNDER) {
      return true;
    }

    if (isRestricted(p)) {
      console.warn("[UmbraDatasetSecurity] Restricted dataset blocked:", p);
      return false;
    }

    if (!isClientScoped(p)) {
      console.warn("[UmbraDatasetSecurity] Non-client dataset blocked:", p);
      return false;
    }

    return true;
  }

  function canExport(type) {

    const role = getRuntimeRole();

    if (role === ROLE_FOUNDER) {
      return true;
    }

    const allowed = [
      "client_summary",
      "outreach_queue",
      "response_log",
      "kpi_snapshot"
    ];

    return allowed.includes(type);
  }

  function guardedFetch(path, options) {

    if (!canAccessDataset(path)) {

      return Promise.reject(
        new Error(
          "[UmbraDatasetSecurity] Dataset access denied."
        )
      );
    }

    return window.fetch(path, options);
  }

  function getDebugState() {

    return {
      version: "umbra_dataset_security_v1",
      role: getRuntimeRole(),
      client_id: getClientId(),
      restricted_roots: RESTRICTED_ROOTS,
      default_client_root: DEFAULT_CLIENT_ROOT
    };
  }

  G.canAccessDataset = canAccessDataset;
  G.canExport = canExport;
  G.guardedFetch = guardedFetch;
  G.getDebugState = getDebugState;

  console.info(
    "[UmbraDatasetSecurity] Dataset access guard active.",
    getDebugState()
  );
})();
