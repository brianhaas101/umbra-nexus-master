(function () {
  "use strict";

  const G = window.BlackDragonBooksQueueUI =
    window.BlackDragonBooksQueueUI || {};

  const QUEUE_URL =
    "/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json";

  let state = {
    queue: null,
    selected: null,
    mounted: false,
    last_error: null
  };

  function getFrontendSecurity() {
    return window.UmbraFrontendSecurity || null;
  }

  function canAccessQueue() {
    const sec = getFrontendSecurity();

    if (!sec || typeof sec.canAccessPanel !== "function") {
      return false;
    }

    return sec.canAccessPanel("OUTREACH_QUEUE");
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

  function injectStyles() {
    if (document.getElementById("bdBooksQueueStyles")) return;

    const css = `
      .bd-books-queue-ui {
        margin-top: 16px;
        border: 1px solid rgba(255,255,255,0.10);
        border-radius: 16px;
        padding: 16px;
        background: rgba(255,255,255,0.035);
      }

      .bd-books-queue-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
      }

      .bd-books-queue-header h3 {
        margin: 0;
        font-size: 16px;
      }

      .bd-books-queue-header p {
        margin: 4px 0 0;
        color: rgba(255,255,255,0.62);
        font-size: 12px;
      }

      .bd-books-queue-layout {
        display: grid;
        grid-template-columns: minmax(280px, 0.95fr) minmax(320px, 1.05fr);
        gap: 12px;
      }

      .bd-books-queue-list,
      .bd-books-message-preview {
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        background: rgba(0,0,0,0.20);
        overflow: hidden;
      }

      .bd-books-queue-item {
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

      .bd-books-queue-item:first-child {
        border-top: 0;
      }

      .bd-books-queue-item:hover,
      .bd-books-queue-item[data-selected="true"] {
        background: rgba(255,255,255,0.07);
      }

      .bd-books-queue-title {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }

      .bd-books-queue-meta,
      .bd-books-route,
      .bd-books-preview-muted {
        color: rgba(255,255,255,0.62);
        font-size: 12px;
      }

      .bd-books-priority-pill {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
        white-space: nowrap;
      }

      .bd-books-message-preview {
        padding: 14px;
      }

      .bd-books-message-preview h4 {
        margin: 0 0 8px;
      }

      .bd-books-preview-body {
        white-space: pre-wrap;
        line-height: 1.5;
        font-size: 13px;
        color: rgba(255,255,255,0.82);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 12px;
        margin: 10px 0;
        background: rgba(255,255,255,0.04);
      }

      .bd-books-button-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .bd-books-btn {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 999px;
        background: rgba(255,255,255,0.07);
        color: #f5f5f5;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
      }

      .bd-books-btn:hover {
        background: rgba(255,255,255,0.12);
      }

      @media (max-width: 980px) {
        .bd-books-queue-layout {
          grid-template-columns: 1fr;
        }
      }
    `;

    const style = document.createElement("style");
    style.id = "bdBooksQueueStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getRoot() {
    let root = document.getElementById("blackDragonBooksQueueUI");

    if (!root) {
      const dashboard =
        document.getElementById("blackDragonBooksDashboard") ||
        document.body;

      root = el("section", {
        id: "blackDragonBooksQueueUI",
        class: "bd-books-queue-ui",
        "data-outreach-queue": "true",
        "data-umbra-panel": "OUTREACH_QUEUE"
      });

      dashboard.appendChild(root);
    }

    return root;
  }

  function queueItems() {
    if (!state.queue) return [];

    return state.queue.ready_queue && state.queue.ready_queue.length
      ? state.queue.ready_queue
      : state.queue.all_queue_items || [];
  }

  function selectItem(entityId) {
    const items = queueItems();

    state.selected =
      items.find(q => q.entity_id === entityId) ||
      items[0] ||
      null;

    render();
  }

  function renderList() {
    const items = queueItems().slice(0, 25);

    const list = el("div", { class: "bd-books-queue-list" });

    if (!items.length) {
      list.appendChild(
        el("div", { class: "bd-books-message-preview" }, [
          el("p", { class: "bd-books-preview-muted", text: "No queue items available." })
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
          class: "bd-books-queue-item",
          "data-entity-id": item.entity_id,
          "data-selected": selected ? "true" : "false",
          onclick: () => selectItem(item.entity_id)
        }, [
          el("div", { class: "bd-books-queue-title" }, [
            el("strong", { text: item.organization_name || "Unknown Organization" }),
            el("span", {
              class: "bd-books-priority-pill",
              text: String(item.unified_priority_tier || "LOW")
            })
          ]),
          el("div", {
            class: "bd-books-queue-meta",
            text:
              (item.leader_role || "UNKNOWN") +
              " ï¿½ Score " +
              String(item.unified_priority_score || 0) +
              " ï¿½ " +
              (item.queue_status || "REVIEW")
          })
        ])
      );
    });

    return list;
  }

  function renderPreview() {
    const item = state.selected || queueItems()[0];

    if (!item) {
      return el("div", { class: "bd-books-message-preview" }, [
        el("h4", { text: "Message Preview" }),
        el("p", { class: "bd-books-preview-muted", text: "Select a target to view the outreach message." })
      ]);
    }

    state.selected = item;

    const route = item.best_contact_route;

    const routeText = route
      ? (route.contact_type + " ï¿½ " + route.value)
      : "No contact route available";

    const fullMessage =
      "Subject: " +
      (item.message_subject || "") +
      "\n\n" +
      (item.message_body || "");

    return el("div", { class: "bd-books-message-preview" }, [
      el("h4", { text: item.organization_name || "Selected Target" }),
      el("p", {
        class: "bd-books-preview-muted",
        text:
          (item.leader_role || "UNKNOWN") +
          " ï¿½ " +
          (item.organization_type || "UNKNOWN")
      }),
      el("p", { class: "bd-books-route", text: "Route: " + routeText }),
      el("div", { class: "bd-books-preview-body", text: fullMessage }),
      el("div", { class: "bd-books-button-row" }, [
        el("button", {
          class: "bd-books-btn",
          onclick: async () => {
            await copyText(item.message_subject || "");
          },
          text: "Copy Subject"
        }),
        el("button", {
          class: "bd-books-btn",
          onclick: async () => {
            await copyText(item.message_body || "");
          },
          text: "Copy Message"
        }),
        el("button", {
          class: "bd-books-btn",
          onclick: async () => {
            await copyText(fullMessage);
          },
          text: "Copy Full Outreach"
        }),
        el("button", {
          class: "bd-books-btn",
          onclick: async () => {
            await copyText(route ? route.value : "");
          },
          text: "Copy Contact Route"
        })
      ])
    ]);
  }

  function render() {
    injectStyles();

    const root = getRoot();

    root.innerHTML = "";

    if (!canAccessQueue()) {
      root.appendChild(
        el("div", { class: "bd-books-message-preview" }, [
          el("h3", { text: "Outreach Queue Restricted" }),
          el("p", {
            class: "bd-books-preview-muted",
            text: "This queue is not available for the current runtime role."
          })
        ])
      );

      return false;
    }

    root.appendChild(
      el("div", { class: "bd-books-queue-header" }, [
        el("div", {}, [
          el("h3", { text: "Outreach Queue" }),
          el("p", { text: "Select a target, review the contact route, and copy the outreach message." })
        ]),
        el("span", {
          class: "bd-books-priority-pill",
          text:
            String((state.queue && state.queue.totals && state.queue.totals.ready) || 0) +
            " ready"
        })
      ])
    );

    root.appendChild(
      el("div", { class: "bd-books-queue-layout" }, [
        renderList(),
        renderPreview()
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
      state.selected = queueItems()[0] || null;
      state.last_error = null;

      return render();
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksQueueUI] Load failed:", err);
      return false;
    }
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_queue_ui_v1",
      mounted: state.mounted,
      has_queue: !!state.queue,
      selected_entity_id: state.selected ? state.selected.entity_id : null,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.render = render;
  G.selectItem = selectItem;
  G.copyText = copyText;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    load();
  });

  if (document.readyState !== "loading") {
    load();
  }
})();


/* BATCH_058_QUEUE_SELECTION_BUS_BRIDGE */
(function () {
  "use strict";

  function bridgeQueueSelection() {
    const bus = window.BlackDragonBooksSelectionBus;
    const api = window.BlackDragonBooksQueueUI;

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
    setTimeout(bridgeQueueSelection, 2000);
  });

  if (document.readyState !== "loading") {
    setTimeout(bridgeQueueSelection, 2000);
  }
})();



