// public/globe/intel/clients/black_dragon.data_loader.js
// Black Dragon Data Loader
// Purpose: load the dedicated Black Dragon lead dataset, process it, summarize it, and expose it safely.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const DATA_URL = "./data/clients/black_dragon/black_dragon_leads_master.json";
  const CLIENT_ID = "black_dragon_omg_cert_v1";

  function getProcessor() {
    const processor = window.UmbraIntel?.adapters?.blackDragonProcessor;

    if (!processor) {
      console.error("[black_dragon.data_loader] Missing blackDragonProcessor.");
      return null;
    }

    return processor;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`[black_dragon.data_loader] Failed to load ${url}: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  function assertDatasetShape(raw) {
    if (!Array.isArray(raw)) {
      console.error("[black_dragon.data_loader] Dataset must be an array.");
      return false;
    }

    const missing = [];

    raw.forEach((lead, index) => {
      if (!lead || typeof lead !== "object") {
        missing.push({ index, issue: "record_not_object" });
        return;
      }

      ["entity_id", "agency_id", "client_id", "agency_name", "agency_type", "state", "country", "source_text"].forEach((field) => {
        if (lead[field] === undefined || lead[field] === null || String(lead[field]).trim() === "") {
          missing.push({ index, entity_id: lead.entity_id || null, field });
        }
      });
    });

    if (missing.length) {
      console.warn("[black_dragon.data_loader] Dataset shape warnings.", missing.slice(0, 25));
    }

    return true;
  }

  function expose(rawLeads, processedLeads, summary) {
    const I = window.UmbraIntel;

    I.clients.blackDragonRawLeads = rawLeads;
    I.clients.blackDragonProcessedLeads = processedLeads;
    I.clients.blackDragonLeadSummary = summary;

    if (window.UmbraGlobe?.state) {
      window.UmbraGlobe.state.blackDragonRawLeads = rawLeads;
      window.UmbraGlobe.state.blackDragonProcessedLeads = processedLeads;
      window.UmbraGlobe.state.blackDragonLeadSummary = summary;
    }

    return summary;
  }

  async function load(options = {}) {
    const url = options.url || DATA_URL;
    const processor = getProcessor();

    if (!processor) {
      return {
        ok: false,
        client_id: CLIENT_ID,
        reason: "missing_processor"
      };
    }

    try {
      const raw = await fetchJson(url);
      assertDatasetShape(raw);

      const onlyClient = raw.filter((lead) => {
        return !lead.client_id || lead.client_id === CLIENT_ID;
      });

      const processed = processor.processLeads(onlyClient);
      const summary = processor.summarizeProcessedLeads(processed);

      const report = {
        ok: true,
        client_id: CLIENT_ID,
        url,
        raw_count: raw.length,
        accepted_count: onlyClient.length,
        processed_count: processed.length,
        summary,
        loaded_at: new Date().toISOString()
      };

      expose(onlyClient, processed, report);

      console.info("[black_dragon.data_loader] Loaded.", report);
      return report;
    } catch (e) {
      console.error("[black_dragon.data_loader] Load failed.", e);

      return {
        ok: false,
        client_id: CLIENT_ID,
        url,
        reason: String(e?.message || e),
        loaded_at: new Date().toISOString()
      };
    }
  }

  function getLeads() {
    return window.UmbraIntel?.clients?.blackDragonProcessedLeads || [];
  }

  function getSummary() {
    return window.UmbraIntel?.clients?.blackDragonLeadSummary || null;
  }

  function getTopLeads(limit = 10) {
    const n = Math.max(1, Math.min(100, Number(limit) || 10));
    return getLeads().slice(0, n);
  }

  window.UmbraIntel.adapters.blackDragonDataLoader = Object.freeze({
    load,
    getLeads,
    getSummary,
    getTopLeads
  });

  console.info("[black_dragon.data_loader] Ready. Run: UmbraIntel.adapters.blackDragonDataLoader.load()");
})();