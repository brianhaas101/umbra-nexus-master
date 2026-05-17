(function () {
  "use strict";

  const G = window.BlackDragonBooksResponseWorkflow =
    window.BlackDragonBooksResponseWorkflow || {};

  let state = {
    installed: false,
    generated_records: 0,
    saved_records: 0,
    exported_records: 0,
    last_generated_record: null,
    last_saved_record: null,
    last_export: null,
    last_error: null
  };

  function now() {
    return new Date().toISOString();
  }

  function getSelection() {
    return (
      window.BlackDragonBooksSelectionBus?.getDebugState?.()?.selected_entity_id ||
      window.BlackDragonBooksQueueUI?.getDebugState?.()?.selected_entity_id ||
      window.BlackDragonBooksResponseUI?.getDebugState?.()?.selected_entity_id ||
      window.UMBRA_SELECTED_CLIENT_TARGET?.entity_id ||
      window.UMBRA_DATA?.client_layers?.black_dragon_books_map_nodes?.[0]?.entity_id ||
      null
    );
  }

  function getTarget() {
    const entityId = getSelection();

    const nodes =
      window.UMBRA_DATA?.client_layers?.black_dragon_books_map_nodes || [];

    if (entityId) {
      const hit = nodes.find(x =>
        String(x.entity_id) === String(entityId)
      );

      if (hit) return hit;

      return {
        entity_id: entityId,
        organization_name:
          window.UMBRA_SELECTED_CLIENT_TARGET?.organization_name ||
          "UNKNOWN_TARGET"
      };
    }

    return nodes[0] || null;
  }

  function buildResponseRecord() {
    const target = getTarget();

    if (!target) {
      state.last_error = "No selected target.";
      return null;
    }

    const record = {
      response_id:
        `BD_RESPONSE_${Date.now()}`,

      client_id:
        "black_dragon",

      module:
        "book_sales_v2",

      entity_id:
        target.entity_id,

      organization_name:
        target.organization_name || target.label,

      response_status:
        "LOGGED",

      response_classification:
        "PENDING_REVIEW",

      response_text:
        "Initial outreach response record generated.",

      books_ordered:
        0,

      estimated_member_orders:
        0,

      estimated_revenue:
        0,

      followup_required:
        true,

      generated_at:
        now(),

      source:
        "BLACK_DRAGON_RESPONSE_WORKFLOW"
    };

    state.generated_records++;
    state.last_generated_record = record;

    window.BLACK_DRAGON_LAST_RESPONSE_RECORD = record;

    try {
      window.dispatchEvent(
        new CustomEvent("umbra:blackDragonResponseGenerated", {
          detail: record
        })
      );
    } catch (err) {}

    return record;
  }

  async function saveGeneratedRecord() {
    const store =
      window.BlackDragonBooksResponseStore;

    const record =
      state.last_generated_record ||
      window.BLACK_DRAGON_LAST_RESPONSE_RECORD;

    if (!store || !record) {
      state.last_error =
        "Missing response store or generated record.";

      return false;
    }

    const saved =
      store.saveRecord(record);

    if (!saved) {
      state.last_error =
        "Failed saving response.";

      return false;
    }

    state.saved_records++;
    state.last_saved_record = saved;

    return true;
  }

  async function exportResponses() {
    const store =
      window.BlackDragonBooksResponseStore;

    if (!store) {
      state.last_error =
        "Missing response store.";

      return null;
    }

    const payload =
      store.exportRecords();

    state.exported_records++;
    state.last_export = {
      exported_at: now(),
      records:
        payload.records.length
    };

    return payload;
  }

  async function copyLatestResponseJson() {
    const record =
      state.last_generated_record ||
      window.BLACK_DRAGON_LAST_RESPONSE_RECORD;

    if (!record) {
      state.last_error =
        "No generated response available.";

      return false;
    }

    const payload =
      JSON.stringify(record, null, 2);

    try {
      await navigator.clipboard.writeText(payload);

      return true;
    } catch (err) {
      state.last_error =
        String(err && err.message ? err.message : err);

      return false;
    }
  }

  function installButtons() {
    const buttons =
      Array.from(document.querySelectorAll("button"));

    const map = [
      {
        rx: /generate response/i,
        fn: buildResponseRecord
      },
      {
        rx: /save response locally/i,
        fn: saveGeneratedRecord
      },
      {
        rx: /copy response json/i,
        fn: copyLatestResponseJson
      },
      {
        rx: /copy local response backup/i,
        fn: exportResponses
      }
    ];

    let patched = 0;

    for (const btn of buttons) {
      const text = btn.textContent || "";

      const hit =
        map.find(x => x.rx.test(text));

      if (!hit || btn.__bdWorkflowPatched) continue;

      btn.__bdWorkflowPatched = true;

      btn.addEventListener("click", function () {
        hit.fn();
      }, true);

      patched++;
    }

    state.installed = true;

    return patched;
  }

  function getDebugState() {
    const store =
      window.BlackDragonBooksResponseStore?.getDebugState?.();

    return {
      version:
        "black_dragon_books_response_workflow_v1",

      installed:
        state.installed,

      selected_entity_id:
        getSelection(),

      generated_records:
        state.generated_records,

      saved_records:
        state.saved_records,

      exported_records:
        state.exported_records,

      persisted_records:
        store?.records || 0,

      last_generated_entity:
        state.last_generated_record?.entity_id || null,

      last_saved_entity:
        state.last_saved_record?.entity_id || null,

      last_error:
        state.last_error
    };
  }

  G.buildResponseRecord = buildResponseRecord;
  G.saveGeneratedRecord = saveGeneratedRecord;
  G.exportResponses = exportResponses;
  G.copyLatestResponseJson = copyLatestResponseJson;
  G.installButtons = installButtons;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(installButtons, 2500);
  });

  if (document.readyState !== "loading") {
    setTimeout(installButtons, 2500);
  }
})();




