(function () {
  "use strict";

  const G = window.BlackDragonBooksDashboard =
    window.BlackDragonBooksDashboard || {};

  const DASHBOARD_URL =
    "/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json";

  const WIDGETS_URL =
    "/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json";

  const QUEUE_URL =
    "/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json";

  let state = {
    dashboard: null,
    widgets: null,
    queue: null,
    mounted: false,
    last_error: null
  };

  function getSecurity() {
    return window.UmbraFrontendSecurity || null;
  }

  function canAccess() {
    const sec = getSecurity();

    if (!sec || typeof sec.canAccessPanel !== "function") {
      return false;
    }

    return sec.canAccessPanel("BLACK_DRAGON_BOOKS");
  }

  function getDatasetSecurity() {
    return window.UmbraDatasetSecurity || null;
  }

  async function safeFetchJson(url) {
    const datasetSecurity = getDatasetSecurity();

    const relativePath =
      url.replace(/^\//, "public/");

    if (
      datasetSecurity &&
      typeof datasetSecurity.guardedFetch === "function"
    ) {
      const res = await datasetSecurity.guardedFetch(relativePath);

      if (!res.ok) {
        throw new Error("Failed to fetch " + url);
      }

      return await res.json();
    }

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch " + url);
    }

    return await res.json();
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);

    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === "class") {
        node.className = value;
      } else if (key === "text") {
        node.textContent = value;
      } else {
        node.setAttribute(key, value);
      }
    });

    (children || []).forEach(child => {
      if (typeof child === "string") {
        node.appendChild(document.createTextNode(child));
      } else if (child) {
        node.appendChild(child);
      }
    });

    return node;
  }

  function formatMoney(v) {
    const n = Number(v || 0);

    return "$" + n.toLocaleString(undefined, {
      maximumFractionDigits: 0
    });
  }

  function createShell() {
    let root = document.getElementById("blackDragonBooksDashboard");

    if (!root) {
      root = el("section", {
        id: "blackDragonBooksDashboard",
        "data-black-dragon-books": "true",
        "data-umbra-panel": "BLACK_DRAGON_BOOKS",
        class: "bd-books-dashboard"
      });

      document.body.appendChild(root);
    }

    return root;
  }

  function renderMetricCard(widget) {
    let value = widget.value;

    if (widget.widget_id === "BD_WIDGET_PROJECTED_REVENUE") {
      value = formatMoney(value);
    }

    return el("article", {
      class: "bd-books-card",
      "data-widget-id": widget.widget_id
    }, [
      el("div", {
        class: "bd-books-card-label",
        text: widget.title
      }),
      el("div", {
        class: "bd-books-card-value",
        text: String(value)
      })
    ]);
  }

  function renderSummaryCard(title, value) {
    const list = el("div", { class: "bd-books-summary-grid" });

    Object.entries(value || {}).forEach(([key, count]) => {
      list.appendChild(
        el("div", { class: "bd-books-summary-row" }, [
          el("span", { text: key.replace(/_/g, " ").toUpperCase() }),
          el("strong", { text: String(count) })
        ])
      );
    });

    return el("article", { class: "bd-books-panel" }, [
      el("h3", { text: title }),
      list
    ]);
  }

  function renderActionList(actions) {
    const list = el("div", {
      class: "bd-books-action-list",
      "data-outreach-queue": "true",
      "data-umbra-panel": "OUTREACH_QUEUE"
    });

    (actions || []).forEach(action => {
      const row = el("article", {
        class: "bd-books-action-row",
        "data-entity-id": action.entity_id
      }, [
        el("div", { class: "bd-books-action-main" }, [
          el("strong", { text: action.organization_name || "Unknown Organization" }),
          el("span", {
            text:
              (action.leader_role || "UNKNOWN") +
              " · " +
              (action.organization_type || "UNKNOWN")
          })
        ]),
        el("div", { class: "bd-books-action-meta" }, [
          el("span", {
            class: "bd-books-pill",
            text: String(action.priority_tier || "LOW")
          }),
          el("span", {
            text: "Score: " + String(action.priority_score || 0)
          }),
          el("span", {
            text: action.recommended_action || "REVIEW"
          })
        ])
      ]);

      list.appendChild(row);
    });

    return el("article", { class: "bd-books-panel bd-books-wide" }, [
      el("h3", { text: "Top Operational Actions" }),
      list
    ]);
  }

  function renderWorkflow(workflow) {
    const wrap = el("div", { class: "bd-books-workflow" });

    (workflow || []).forEach(step => {
      wrap.appendChild(
        el("div", { class: "bd-books-workflow-step" }, [
          el("strong", { text: String(step.step) }),
          el("span", { text: step.label }),
          el("small", { text: step.data_source })
        ])
      );
    });

    return el("article", { class: "bd-books-panel bd-books-wide" }, [
      el("h3", { text: "Operator Workflow" }),
      wrap
    ]);
  }

  function injectStyles() {
    if (document.getElementById("bdBooksDashboardStyles")) return;

    const css = `
      .bd-books-dashboard {
        position: relative;
        z-index: 30;
        margin: 24px;
        padding: 24px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 18px;
        background: rgba(4, 7, 12, 0.86);
        color: #f5f5f5;
        font-family: Inter, system-ui, sans-serif;
        box-shadow: 0 18px 48px rgba(0,0,0,0.35);
      }

      .bd-books-dashboard h2 {
        margin: 0 0 6px;
        font-size: 22px;
        letter-spacing: 0.02em;
      }

      .bd-books-dashboard p {
        margin: 0;
        color: rgba(255,255,255,0.68);
      }

      .bd-books-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      .bd-books-scope {
        font-size: 12px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.16);
        color: rgba(255,255,255,0.7);
      }

      .bd-books-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .bd-books-card,
      .bd-books-panel {
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        background: rgba(255,255,255,0.045);
        padding: 14px;
      }

      .bd-books-card-label {
        font-size: 12px;
        color: rgba(255,255,255,0.62);
        margin-bottom: 8px;
      }

      .bd-books-card-value {
        font-size: 24px;
        font-weight: 700;
      }

      .bd-books-panels {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .bd-books-wide {
        grid-column: 1 / -1;
      }

      .bd-books-panel h3 {
        margin: 0 0 12px;
        font-size: 15px;
      }

      .bd-books-summary-row,
      .bd-books-action-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
        border-top: 1px solid rgba(255,255,255,0.08);
      }

      .bd-books-summary-row:first-child,
      .bd-books-action-row:first-child {
        border-top: 0;
      }

      .bd-books-summary-row span,
      .bd-books-action-main span,
      .bd-books-action-meta span,
      .bd-books-workflow-step small {
        color: rgba(255,255,255,0.62);
        font-size: 12px;
      }

      .bd-books-action-main {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .bd-books-action-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .bd-books-pill {
        border: 1px solid rgba(255,255,255,0.16);
        border-radius: 999px;
        padding: 3px 8px;
      }

      .bd-books-workflow {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .bd-books-workflow-step {
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      @media (max-width: 900px) {
        .bd-books-grid,
        .bd-books-panels,
        .bd-books-workflow {
          grid-template-columns: 1fr;
        }
      }
    `;

    const style = document.createElement("style");
    style.id = "bdBooksDashboardStyles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function render() {
    const root = createShell();

    root.innerHTML = "";

    if (!canAccess()) {
      root.appendChild(
        el("div", { class: "bd-books-panel" }, [
          el("h2", { text: "Access restricted" }),
          el("p", { text: "This dashboard is not available for the current runtime role." })
        ])
      );

      return false;
    }

    const dashboard = state.dashboard;
    const widgets = state.widgets;

    root.appendChild(
      el("div", { class: "bd-books-header" }, [
        el("div", {}, [
          el("h2", { text: "Black Dragon Books — Operator Dashboard" }),
          el("p", {
            text: "Outreach queue, adaptive priorities, responses, and projected book-sales impact."
          })
        ]),
        el("div", {
          class: "bd-books-scope",
          text: dashboard.client.operator_mode + " · " + dashboard.client.dashboard_scope
        })
      ])
    );

    const metricGrid = el("div", { class: "bd-books-grid" });

    (widgets.widgets || [])
      .filter(w => w.type === "metric_card")
      .forEach(w => metricGrid.appendChild(renderMetricCard(w)));

    root.appendChild(metricGrid);

    const panels = el("div", { class: "bd-books-panels" });

    panels.appendChild(
      renderSummaryCard("Priority Summary", dashboard.priority_summary)
    );

    panels.appendChild(
      renderSummaryCard("Response Summary", dashboard.response_summary)
    );

    panels.appendChild(
      renderActionList(dashboard.top_operational_actions)
    );

    panels.appendChild(
      renderWorkflow(dashboard.operator_workflow)
    );

    root.appendChild(panels);

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
      injectStyles();

      state.dashboard = await safeFetchJson(DASHBOARD_URL);
      state.widgets = await safeFetchJson(WIDGETS_URL);
      state.queue = await safeFetchJson(QUEUE_URL);
      state.last_error = null;

      return render();
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksDashboard] Load failed:", err);
      return false;
    }
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_dashboard_renderer_v1",
      mounted: state.mounted,
      has_dashboard: !!state.dashboard,
      has_widgets: !!state.widgets,
      has_queue: !!state.queue,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.render = render;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    load();
  });

  if (document.readyState !== "loading") {
    load();
  }
})();



