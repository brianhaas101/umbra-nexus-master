// public/globe/intel/layers/source_catalog.completion.v1.js
// Umbra Nexus Source Catalog Completion V1
// Purpose: ensure every source referenced by the 12-layer registry exists in the source catalog.
// This prevents baseline layer integrity from failing due to undefined source IDs.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  const catalog = window.UmbraIntel.layers.sourceCatalog;
  const registry = window.UmbraIntel.layers.registry;

  if (!catalog || !registry) {
    console.error("[source_catalog.completion.v1] Missing source catalog or registry.");
    return;
  }

  const SOURCE_TRUST = catalog.trust_levels || {};
  const SOURCE_TYPES = catalog.source_types || {};

  function titleFromId(id) {
    return String(id || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function inferType(sourceId) {
    const id = String(sourceId || "").toLowerCase();

    if (id.includes("budget") || id.includes("minutes") || id.includes("records") || id.includes("public")) {
      return SOURCE_TYPES.public_record || "public_record";
    }

    if (id.includes("rfp") || id.includes("purchase") || id.includes("procurement") || id.includes("vendor")) {
      return SOURCE_TYPES.procurement || "procurement";
    }

    if (id.includes("grant")) {
      return SOURCE_TYPES.grant || "grant";
    }

    if (id.includes("training") || id.includes("academy") || id.includes("post") || id.includes("course") || id.includes("certification")) {
      return SOURCE_TYPES.training || "training";
    }

    if (id.includes("conference") || id.includes("association") || id.includes("speaker") || id.includes("exhibitor")) {
      return SOURCE_TYPES.conference || "conference";
    }

    if (id.includes("linkedin") || id.includes("profile") || id.includes("role")) {
      return SOURCE_TYPES.professional_profile || "professional_profile";
    }

    if (id.includes("news") || id.includes("arrest") || id.includes("raid") || id.includes("incident") || id.includes("indictment")) {
      return SOURCE_TYPES.news || "news";
    }

    if (id.includes("email") || id.includes("phone") || id.includes("validation") || id.includes("verification")) {
      return SOURCE_TYPES.verification || "verification";
    }

    if (id.includes("crm") || id.includes("sales") || id.includes("outreach") || id.includes("notes")) {
      return SOURCE_TYPES.feedback || "feedback";
    }

    if (id.includes("rule") || id.includes("threshold") || id.includes("rejection") || id.includes("detection")) {
      return SOURCE_TYPES.derived_rule || "derived_rule";
    }

    if (id.includes("website") || id.includes("official") || id.includes("press_release")) {
      return SOURCE_TYPES.official || "official";
    }

    return SOURCE_TYPES.directory || "directory";
  }

  function inferTrust(sourceId, type) {
    const id = String(sourceId || "").toLowerCase();

    if (type === (SOURCE_TYPES.official || "official")) return SOURCE_TRUST.OFFICIAL || 1.0;
    if (type === (SOURCE_TYPES.feedback || "feedback")) return SOURCE_TRUST.FEEDBACK || 0.95;
    if (type === (SOURCE_TYPES.public_record || "public_record")) return SOURCE_TRUST.HIGH || 0.9;
    if (type === (SOURCE_TYPES.procurement || "procurement")) return SOURCE_TRUST.HIGH || 0.9;
    if (type === (SOURCE_TYPES.grant || "grant")) return SOURCE_TRUST.HIGH || 0.9;
    if (type === (SOURCE_TYPES.training || "training")) return SOURCE_TRUST.HIGH || 0.9;
    if (id.includes("linkedin")) return SOURCE_TRUST.MEDIUM || 0.75;
    if (type === (SOURCE_TYPES.news || "news")) return SOURCE_TRUST.MEDIUM || 0.75;
    if (type === (SOURCE_TYPES.derived_rule || "derived_rule")) return SOURCE_TRUST.HIGH || 0.9;

    return SOURCE_TRUST.MEDIUM || 0.75;
  }

  function inferFreshnessDays(sourceId, type) {
    const id = String(sourceId || "").toLowerCase();

    if (id.includes("recent") || id.includes("active") || id.includes("job_posting")) return 30;
    if (id.includes("news") || id.includes("incident") || id.includes("raid") || id.includes("arrest")) return 30;
    if (id.includes("training") || id.includes("conference")) return 90;
    if (id.includes("promotion") || id.includes("appointment")) return 365;
    if (id.includes("budget") || id.includes("fiscal") || id.includes("grant")) return 365;
    if (id.includes("annual_report")) return 730;
    if (type === (SOURCE_TYPES.feedback || "feedback")) return 365;
    if (type === (SOURCE_TYPES.derived_rule || "derived_rule")) return 9999;

    return 180;
  }

  function ensureSource(sourceId) {
    if (catalog.sources[sourceId]) return false;

    const type = inferType(sourceId);

    catalog.sources[sourceId] = Object.freeze({
      source_id: sourceId,
      type,
      trust: inferTrust(sourceId, type),
      freshness_days: inferFreshnessDays(sourceId, type),
      description: `${titleFromId(sourceId)} source category used by the Umbra Nexus intelligence layer registry.`
    });

    return true;
  }

  function completeCatalog() {
    const added = [];

    registry.layers.forEach((layer) => {
      (layer.source_categories || []).forEach((sourceId) => {
        if (ensureSource(sourceId)) {
          added.push(sourceId);
        }
      });
    });

    const report = {
      system: "Umbra Nexus Source Catalog Completion",
      stage: "SOURCE_CATALOG_COMPLETION",
      added_count: added.length,
      added_sources: added,
      total_sources: Object.keys(catalog.sources).length,
      timestamp: new Date().toISOString()
    };

    console.info("[source_catalog.completion.v1] Complete.", report);
    return report;
  }

  window.UmbraIntel.layers.completeSourceCatalog = completeCatalog;
  completeCatalog();
})();