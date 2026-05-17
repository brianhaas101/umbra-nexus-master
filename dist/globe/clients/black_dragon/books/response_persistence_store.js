(function () {
  "use strict";

  const G = window.BlackDragonBooksResponseStore =
    window.BlackDragonBooksResponseStore || {};

  const STORAGE_KEY =
    "black_dragon_books_local_response_records_v1";

  let state = {
    loaded: false,
    records: [],
    last_error: null
  };

  function now() {
    return new Date().toISOString();
  }

  function readRaw() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.records) ? parsed.records : [];
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return [];
    }
  }

  function writeRaw(records) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: "black_dragon_books_local_response_records_v1",
          updated_at: now(),
          records
        }, null, 2)
      );

      state.records = records.slice();
      state.loaded = true;
      state.last_error = null;

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return false;
    }
  }

  function load() {
    state.records = readRaw();
    state.loaded = true;
    return state.records.slice();
  }

  function normalizeRecord(record) {
    const r = record && typeof record === "object" ? record : {};

    return {
      response_id:
        r.response_id ||
        `BD_BOOK_LOCAL_RESPONSE_${Date.now()}_${Math.random().toString(16).slice(2)}`,

      client_id:
        "black_dragon",

      module:
        "book_sales_v2",

      entity_id:
        r.entity_id || null,

      organization_name:
        r.organization_name || r.target_name || "UNKNOWN_TARGET",

      response_status:
        r.response_status || r.status || "LOGGED",

      response_classification:
        r.response_classification || r.classification || null,

      received_at:
        r.received_at || now(),

      response_text:
        r.response_text || r.summary || "",

      endorsement_type:
        r.endorsement_type || null,

      books_ordered:
        Number(r.books_ordered || 0),

      estimated_member_orders:
        Number(r.estimated_member_orders || 0),

      estimated_revenue:
        Number(r.estimated_revenue || 0),

      followup_required:
        !!r.followup_required,

      notes:
        r.notes || "",

      source:
        "LOCAL_CLIENT_RESPONSE_STORE",

      created_at:
        r.created_at || now()
    };
  }

  function saveRecord(record) {
    const existing = state.loaded ? state.records.slice() : load();
    const normalized = normalizeRecord(record);

    const filtered = existing.filter(r =>
      r.response_id !== normalized.response_id
    );

    filtered.unshift(normalized);

    const ok = writeRaw(filtered);

    try {
      window.dispatchEvent(
        new CustomEvent("umbra:blackDragonLocalResponseSaved", {
          detail: normalized
        })
      );
    } catch (err) {}

    return ok ? normalized : null;
  }

  function getRecords() {
    if (!state.loaded) load();
    return state.records.slice();
  }

  function exportRecords() {
    return {
      version: "black_dragon_books_local_response_export_v1",
      generated_at: now(),
      client_id: "black_dragon",
      module: "book_sales_v2",
      records: getRecords()
    };
  }

  function copyExportToClipboard() {
    const payload = JSON.stringify(exportRecords(), null, 2);

    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      return navigator.clipboard.writeText(payload).then(() => true);
    }

    return Promise.resolve(false);
  }

  function clearRecords() {
    return writeRaw([]);
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_response_store_v1",
      loaded: state.loaded,
      records: getRecords().length,
      storage_key: STORAGE_KEY,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.saveRecord = saveRecord;
  G.getRecords = getRecords;
  G.exportRecords = exportRecords;
  G.copyExportToClipboard = copyExportToClipboard;
  G.clearRecords = clearRecords;
  G.getDebugState = getDebugState;

  load();
})();



