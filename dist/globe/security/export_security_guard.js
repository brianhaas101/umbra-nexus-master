(function () {
  "use strict";

  const G = window.UmbraExportSecurity = window.UmbraExportSecurity || {};

  function getDatasetSecurity() {
    return window.UmbraDatasetSecurity || null;
  }

  function canExport(type) {

    const sec = getDatasetSecurity();

    if (!sec || typeof sec.canExport !== "function") {
      return false;
    }

    return sec.canExport(type);
  }

  function guardedExport(type, payload) {

    if (!canExport(type)) {

      console.warn(
        "[UmbraExportSecurity] Export blocked:",
        type
      );

      return {
        success: false,
        blocked: true,
        export_type: type
      };
    }

    return {
      success: true,
      blocked: false,
      export_type: type,
      exported_at: new Date().toISOString(),
      payload
    };
  }

  function getDebugState() {

    return {
      version: "umbra_export_security_v1",
      export_guard_active: true
    };
  }

  G.canExport = canExport;
  G.guardedExport = guardedExport;
  G.getDebugState = getDebugState;

  console.info(
    "[UmbraExportSecurity] Export guard active."
  );
})();
