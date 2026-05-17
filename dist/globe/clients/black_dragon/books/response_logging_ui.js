(function () {
  "use strict";

  const G = window.BlackDragonBooksResponseUI =
    window.BlackDragonBooksResponseUI || {};

  const QUEUE_URL =
    "/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json";

  const RESPONSES_URL =
    "/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json";

  const STATUS_VALUES = [
    "NO_RESPONSE",
    "RESPONDED",
    "INTERESTED",
    "ENDORSED",
    "BULK_ORDER",
    "CLOSED",
    "NOT_A_FIT"
  ];

  let state = {
    queue: null,
    responses: null,
    selected: null,
    mounted: false,
    last_error: null,
    draft_result: null
  };

  function getFrontendSecurity() {
    return window.UmbraFrontendSecurity || null;
  }

  function canAccessResponseLog() {
    const sec = getFrontendSecurity();

    if (!sec || typeof sec.canAccessPanel !== "function") {
      return false;
    }

    return sec.canAccessPanel("RESPONSE_LOG");
  }

  function getDatasetSecurity() {
    return window.UmbraDatasetSecurity || null;
  }

  async function safeFetchJson(url) {
    const datasetSecurity = getDatasetSecurity();
    const relativePath = url.replace(/^\//, "public/");

    if (
      datasetSecurity &&
      typeof datasetSecurity.guardedFetch === "function"
    ) {
      const res = await datasetSecurity.guardedFetch(relativePath);

      if (!res.ok) throw new Error("Failed to fetch " + url);

      return await res.json();
    }

    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to fetch " + url);

    return await res.json();
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);

    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "value") node.value = value;
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, value);
      }
    });

    (children || []).forEach(child => {
      if (typeof child === "string") node.appendChild(document.createTextNode(child));
      else if (child) node.appendChild(child);
    });

    return node;
  }

  function injectStyles() {
    if (document.getElementById("bdBooksResponseStyles")) return;

    const css = `
      .bd-books-response-ui {
        margin-top: 16px;
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 16px;
        padding: 16px;
        background: rgba(255,255,255,0.035);
      }

      .bd-books-response-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
      }

      .bd-books-response-header h3 {
        margin: 0;
        font-size: 16px;
      }

      .bd-books-response-header p {
        margin: 4px 0 0;
        color: rgba(255,255,255,0.62);
        font-size: 12px;
      }

      .bd-books-response-layout {
        display: grid;
        grid-template-columns: minmax(280px, 0.9fr) minmax(340px, 1.1fr);
        gap: 12px;
      }

      .bd-books-response-list,
      .bd-books-response-form {
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        background: rgba(0,0,0,0.20);
        overflow: hidden;
      }

      .bd-books-response-item {
        width: 100%;
        text-align: left;
        display: block;
        padding: 12px;
        border: 0;
        border-top: 1px solid rgba(255,255,255,0.07);
        background: transparent;
        color: #f5f5f5;
        cursor: pointer;
      }

      .bd-books-response-item:first-child {
        border-top: 0;
      }

      .bd-books-response-item:hover,
      .bd-books-response-item[data-selected="true"] {
        background: rgba(255,255,255,0.07);
      }

      .bd-books-response-form {
        padding: 14px;
      }

      .bd-books-response-form h4 {
        margin: 0 0 8px;
      }

      .bd-books-form-row {
        display: grid;
        gap: 6px;
        margin-bottom: 10px;
      }

      .bd-books-form-row label {
        font-size: 12px;
        color: rgba(255,255,255,0.62);
      }

      .bd-books-form-row input,
      .bd-books-form-row select,
      .bd-books-form-row textarea {
        width: 100%;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(0,0,0,0.28);
        color: #f5f5f5;
        padding: 9px 10px;
        font: inherit;
      }

      .bd-books-form-row textarea {
        min-height: 90px;
        resize: vertical;
      }

      .bd-books-form-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .bd-books-response-muted {
        color: rgba(255,255,255,0.62);
        font-size: 12px;
      }

      .bd-books-response-pill {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 999px;
        padding: 3px 8px;
        font-size: 11px;
        white-space: nowrap;
      }

      .bd-books-response-button-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 12px;
      }

      .bd-books-response-btn {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 999px;
        background: rgba(255,255,255,0.07);
        color: #f5f5f5;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
      }

      .bd-books-response-btn:hover {
        background: rgba(255,255,255,0.12);
      }

      .bd-books-response-output {
        white-space: pre-wrap;
        margin-top: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 12px;
        background: rgba(255,255,255,0.04);
        font-size: 12px;
        color: rgba(255,255,255,0.78);
      }

      @media (max-width: 980px) {
        .bd-books-response-layout,
        .bd-books-form-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    const style = document.createElement("style");
    style.id = "bdBooksResponseStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getRoot() {
    let root = document.getElementById("blackDragonBooksResponseUI");

    if (!root) {
      const dashboard =
        document.getElementById("blackDragonBooksDashboard") ||
        document.body;

      root = el("section", {
        id: "blackDragonBooksResponseUI",
        class: "bd-books-response-ui",
        "data-response-log": "true",
        "data-umbra-panel": "RESPONSE_LOG"
      });

      dashboard.appendChild(root);
    }

    return root;
  }

  function queueItems() {
    if (!state.queue) return [];

    return state.queue.all_queue_items || [];
  }

  function selectItem(entityId) {
    const items = queueItems();

    state.selected =
      items.find(q => q.entity_id === entityId) ||
      items[0] ||
      null;

    render();
  }

  function buildResultPayload(formValues) {
    const item = state.selected || queueItems()[0];

    if (!item) return null;

    return {
      response_id:
        "BD_BOOK_RESP_" +
        item.entity_id +
        "_" +
        new Date().toISOString().replace(/[^0-9]/g, ""),

      entity_id: item.entity_id,
      organization_name: item.organization_name,
      received_at: formValues.received_at || new Date().toISOString(),

      response_status:
        formValues.response_status || "RESPONDED",

      response_text:
        formValues.response_text || "",

      endorsement_type:
        formValues.endorsement_type || null,

      books_ordered:
        Number(formValues.books_ordered || 0),

      estimated_member_orders:
        Number(formValues.estimated_member_orders || 0),

      estimated_revenue:
        Number(formValues.estimated_revenue || 0),

      followup_required:
        !!formValues.followup_required,

      notes:
        formValues.notes || null
    };
  }

  async function copyText(text) {
    const value = String(text || "");

    if (!value) return false;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (err) {}

    const area = document.createElement("textarea");
    area.value = value;
    document.body.appendChild(area);
    area.select();

    try {
      document.execCommand("copy");
      document.body.removeChild(area);
      return true;
    } catch (err) {
      document.body.removeChild(area);
      return false;
    }
  }

  function renderList() {
    const items = queueItems().slice(0, 30);
    const list = el("div", { class: "bd-books-response-list" });

    if (!items.length) {
      list.appendChild(
        el("div", { class: "bd-books-response-form" }, [
          el("p", { class: "bd-books-response-muted", text: "No queue items available." })
        ])
      );

      return list;
    }

    items.forEach(item => {
      const selected =
        state.selected &&
        state.selected.entity_id === item.entity_id;

      list.appendChild(
        el("button", {
          class: "bd-books-response-item",
          "data-entity-id": item.entity_id,
          "data-selected": selected ? "true" : "false",
          onclick: () => selectItem(item.entity_id)
        }, [
          el("div", {}, [
            el("strong", { text: item.organization_name || "Unknown Organization" })
          ]),
          el("div", {
            class: "bd-books-response-muted",
            text:
              (item.leader_role || "UNKNOWN") +
              " ï¿½ " +
              (item.queue_status || "QUEUE")
          })
        ])
      );
    });

    return list;
  }

  function renderStatusOptions() {
    return STATUS_VALUES.map(status =>
      el("option", { value: status, text: status })
    );
  }

  function renderForm() {
    const item = state.selected || queueItems()[0];

    if (!item) {
      return el("div", { class: "bd-books-response-form" }, [
        el("h4", { text: "Log Response" }),
        el("p", { class: "bd-books-response-muted", text: "Select a target to log an outcome." })
      ]);
    }

    state.selected = item;

    const statusSelect = el("select", { id: "bdResponseStatus" }, renderStatusOptions());

    const output = el("div", {
      id: "bdResponseGeneratedOutput",
      class: "bd-books-response-output",
      text: "Generated response record will appear here."
    });

    function collect() {
      return {
        response_status: statusSelect.value,
        received_at: document.getElementById("bdResponseReceivedAt").value,
        response_text: document.getElementById("bdResponseText").value,
        endorsement_type: document.getElementById("bdResponseEndorsementType").value,
        books_ordered: document.getElementById("bdResponseBooksOrdered").value,
        estimated_member_orders: document.getElementById("bdResponseMemberOrders").value,
        estimated_revenue: document.getElementById("bdResponseEstimatedRevenue").value,
        followup_required: document.getElementById("bdResponseFollowupRequired").checked,
        notes: document.getElementById("bdResponseNotes").value
      };
    }

    return el("div", { class: "bd-books-response-form" }, [
      el("h4", { text: "Log Response / Outcome" }),
      el("p", {
        class: "bd-books-response-muted",
        text:
          item.organization_name +
          " ï¿½ " +
          (item.leader_role || "UNKNOWN")
      }),

      el("div", { class: "bd-books-form-row" }, [
        el("label", { text: "Response Status" }),
        statusSelect
      ]),

      el("div", { class: "bd-books-form-row" }, [
        el("label", { text: "Received At" }),
        el("input", {
          id: "bdResponseReceivedAt",
          type: "datetime-local"
        })
      ]),

      el("div", { class: "bd-books-form-row" }, [
        el("label", { text: "Response Text / Summary" }),
        el("textarea", {
          id: "bdResponseText",
          placeholder: "Paste or summarize the response here."
        })
      ]),

      el("div", { class: "bd-books-form-grid" }, [
        el("div", { class: "bd-books-form-row" }, [
          el("label", { text: "Endorsement Type" }),
          el("input", {
            id: "bdResponseEndorsementType",
            placeholder: "e.g. RECOMMENDED_READING"
          })
        ]),
        el("div", { class: "bd-books-form-row" }, [
          el("label", { text: "Books Ordered" }),
          el("input", {
            id: "bdResponseBooksOrdered",
            type: "number",
            min: "0",
            value: "0"
          })
        ]),
        el("div", { class: "bd-books-form-row" }, [
          el("label", { text: "Estimated Member Orders" }),
          el("input", {
            id: "bdResponseMemberOrders",
            type: "number",
            min: "0",
            value: "0"
          })
        ])
      ]),

      el("div", { class: "bd-books-form-row" }, [
        el("label", { text: "Estimated Revenue" }),
        el("input", {
          id: "bdResponseEstimatedRevenue",
          type: "number",
          min: "0",
          step: "0.01",
          value: "0"
        })
      ]),

      el("div", { class: "bd-books-form-row" }, [
        el("label", {}, [
          el("input", {
            id: "bdResponseFollowupRequired",
            type: "checkbox"
          }),
          " Follow-up required"
        ])
      ]),

      el("div", { class: "bd-books-form-row" }, [
        el("label", { text: "Notes" }),
        el("textarea", {
          id: "bdResponseNotes",
          placeholder: "Operational notes."
        })
      ]),

      el("div", { class: "bd-books-response-button-row" }, [
        el("button", {
          class: "bd-books-response-btn",
          onclick: () => {
            const payload = buildResultPayload(collect());
            state.draft_result = payload;
            output.textContent = JSON.stringify(payload, null, 2);
          },
          text: "Generate Response Record"
        }),
        el("button", {
          class: "bd-books-response-btn",
          onclick: async () => {
            const payload = state.draft_result || buildResultPayload(collect());
            await copyText(JSON.stringify(payload, null, 2));
            output.textContent = JSON.stringify(payload, null, 2);
          },
          text: "Copy Response JSON"
        })
      ]),

      output
    ]);
  }

  function render() {
    injectStyles();

    const root = getRoot();
    root.innerHTML = "";

    if (!canAccessResponseLog()) {
      root.appendChild(
        el("div", { class: "bd-books-response-form" }, [
          el("h3", { text: "Response Log Restricted" }),
          el("p", {
            class: "bd-books-response-muted",
            text: "This response logger is not available for the current runtime role."
          })
        ])
      );

      return false;
    }

    root.appendChild(
      el("div", { class: "bd-books-response-header" }, [
        el("div", {}, [
          el("h3", { text: "Response Logging" }),
          el("p", {
            text: "Capture real-world outcomes after outreach and copy the JSON into the response ingestion file."
          })
        ]),
        el("span", {
          class: "bd-books-response-pill",
          text:
            String(queueItems().length) +
            " targets"
        })
      ])
    );

    root.appendChild(
      el("div", { class: "bd-books-response-layout" }, [
        renderList(),
        renderForm()
      ])
    );

    if (
      window.UmbraUIPanelSecurity &&
      typeof window.UmbraUIPanelSecurity.applySecurity === "function"
    ) {
      window.UmbraUIPanelSecurity.applySecurity(root);
    }

    state.mounted = true;

    return true;
  }

  async function load() {
    try {
      state.queue = await safeFetchJson(QUEUE_URL);
      state.responses = await safeFetchJson(RESPONSES_URL);
      state.selected = queueItems()[0] || null;
      state.last_error = null;

      return render();
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksResponseUI] Load failed:", err);
      return false;
    }
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_response_ui_v1",
      mounted: state.mounted,
      has_queue: !!state.queue,
      has_responses: !!state.responses,
      selected_entity_id: state.selected ? state.selected.entity_id : null,
      has_draft_result: !!state.draft_result,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.render = render;
  G.selectItem = selectItem;
  G.buildResultPayload = buildResultPayload;
  G.copyText = copyText;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    load();
  });

  if (document.readyState !== "loading") {
    load();
  }
})();


/* =========================================================
   BATCH 055 ï¿½ LOCAL RESPONSE PERSISTENCE BRIDGE
   Non-destructive: stores pilot response records in localStorage.
   ========================================================= */

(function () {
  "use strict";

  function getStore() {
    return window.BlackDragonBooksResponseStore || null;
  }

  function getLastGeneratedRecord() {
    const candidates = [
      "BLACK_DRAGON_LAST_RESPONSE_RECORD",
      "UMBRA_LAST_RESPONSE_RECORD",
      "BLACK_DRAGON_GENERATED_RESPONSE_RECORD"
    ];

    for (const key of candidates) {
      if (window[key] && typeof window[key] === "object") {
        return window[key];
      }
    }

    const output =
      document.querySelector("[data-response-output]") ||
      document.querySelector("#blackDragonResponseOutput") ||
      document.querySelector(".response-output");

    if (output && output.textContent) {
      try {
        return JSON.parse(output.textContent);
      } catch (err) {}
    }

    return null;
  }

  function saveGeneratedResponse() {
    const store = getStore();

    if (!store || typeof store.saveRecord !== "function") {
      console.warn("[BlackDragonBooksResponsePersistence] Store missing.");
      return null;
    }

    const record = getLastGeneratedRecord();

    if (!record) {
      console.warn("[BlackDragonBooksResponsePersistence] No generated response record found.");
      return null;
    }

    const saved = store.saveRecord(record);

    console.info("[BlackDragonBooksResponsePersistence] Saved response", saved);

    return saved;
  }

  function installPersistenceButton() {
    const existing =
      document.getElementById("blackDragonSaveResponseLocal");

    if (existing) return true;

    const buttons = Array.from(document.querySelectorAll("button"));
    const copyButton = buttons.find(b =>
      /copy response json/i.test(b.textContent || "")
    );

    if (!copyButton || !copyButton.parentElement) {
      return false;
    }

    const btn = document.createElement("button");
    btn.id = "blackDragonSaveResponseLocal";
    btn.textContent = "Save Response Locally";
    btn.type = "button";
    btn.addEventListener("click", saveGeneratedResponse);

    copyButton.parentElement.appendChild(btn);

    return true;
  }

  function installExportButton() {
    const existing =
      document.getElementById("blackDragonExportLocalResponses");

    if (existing) return true;

    const root =
      document.querySelector("[data-black-dragon-books]") ||
      document.body;

    const btn = document.createElement("button");
    btn.id = "blackDragonExportLocalResponses";
    btn.textContent = "Copy Local Response Backup";
    btn.type = "button";
    btn.style.marginLeft = "8px";

    btn.addEventListener("click", function () {
      const store = getStore();

      if (
        store &&
        typeof store.copyExportToClipboard === "function"
      ) {
        store.copyExportToClipboard();
      }
    });

    const copyButton = Array.from(document.querySelectorAll("button")).find(b =>
      /copy response json/i.test(b.textContent || "")
    );

    if (copyButton && copyButton.parentElement) {
      copyButton.parentElement.appendChild(btn);
    } else {
      root.appendChild(btn);
    }

    return true;
  }

  function patchGeneratedRecordCapture() {
    const originalLog = console.info;

    if (window.__BD_RESPONSE_CAPTURE_PATCHED__) return true;

    window.__BD_RESPONSE_CAPTURE_PATCHED__ = true;

    console.info = function () {
      try {
        const args = Array.from(arguments);
        const possibleRecord = args.find(a =>
          a &&
          typeof a === "object" &&
          (
            a.response_id ||
            a.entity_id ||
            a.response_status ||
            a.response_classification
          )
        );

        if (possibleRecord) {
          window.BLACK_DRAGON_LAST_RESPONSE_RECORD = possibleRecord;
        }
      } catch (err) {}

      return originalLog.apply(console, arguments);
    };

    return true;
  }

  function install() {
    patchGeneratedRecordCapture();
    installPersistenceButton();
    installExportButton();

    return {
      save_button:
        !!document.getElementById("blackDragonSaveResponseLocal"),
      export_button:
        !!document.getElementById("blackDragonExportLocalResponses"),
      store:
        !!getStore()
    };
  }

  window.BlackDragonBooksResponsePersistence = {
    install,
    saveGeneratedResponse,
    getLastGeneratedRecord,
    getDebugState: function () {
      const store = getStore();

      return {
        version: "black_dragon_books_response_persistence_bridge_v1",
        save_button:
          !!document.getElementById("blackDragonSaveResponseLocal"),
        export_button:
          !!document.getElementById("blackDragonExportLocalResponses"),
        store_present:
          !!store,
        stored_records:
          store && typeof store.getRecords === "function"
            ? store.getRecords().length
            : null
      };
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(install, 2500);
  });

  if (document.readyState !== "loading") {
    setTimeout(install, 2500);
  }

  window.addEventListener("umbra:blackDragonLocalResponseSaved", function () {
    setTimeout(install, 250);
  });
})();


/* BATCH_058_RESPONSE_SELECTION_BUS_BRIDGE */
(function () {
  "use strict";

  function bridgeResponseSelection() {
    const bus = window.BlackDragonBooksSelectionBus;
    const api = window.BlackDragonBooksResponseUI;

    if (!bus || !api || api.__selectionBusBridge) return false;

    api.__selectionBusBridge = true;

    const originalGetDebugState = api.getDebugState;

    api.getDebugState = function () {
      const debug = originalGetDebugState ? originalGetDebugState.call(api) : {};
      const selected = bus.getDebugState().selected_entity_id || debug.selected_entity_id || null;

      return {
        ...debug,
        selected_entity_id: selected,
        selection_bus_active: true
      };
    };

    window.addEventListener("umbra:blackDragonSelectionChanged", function (ev) {
      const entityId = ev?.detail?.entity_id;

      if (!entityId) return;

      if (typeof api.selectByEntityId === "function") {
        api.selectByEntityId(entityId);
      }
    });

    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bridgeResponseSelection, 2000);
  });

  if (document.readyState !== "loading") {
    setTimeout(bridgeResponseSelection, 2000);
  }
})();



