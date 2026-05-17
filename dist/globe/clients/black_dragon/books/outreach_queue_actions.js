(function () {
  "use strict";

  const G = window.BlackDragonBooksQueueActions =
    window.BlackDragonBooksQueueActions || {};

  let state = {
    installed: false,
    last_action: null,
    last_error: null
  };

  function getQueueItems() {
    try {
      const direct =
        window.BlackDragonBooksQueueUI?.queue ||
        window.BlackDragonBooksQueueUI?.items ||
        window.BlackDragonBooksQueueUI?.getQueue?.() ||
        window.UMBRA_DATA?.black_dragon_books_queue ||
        window.UMBRA_DATA?.client_layers?.black_dragon_books_queue ||
        window.UMBRA_BLACK_DRAGON_BOOKS_QUEUE ||
        [];

      if (Array.isArray(direct) && direct.length) {
        return direct;
      }
    } catch (err) {}

    try {
      const nodes =
        window.UMBRA_DATA?.client_layers?.black_dragon_books_map_nodes || [];

      if (Array.isArray(nodes) && nodes.length) {
        return nodes.map(n => ({
          entity_id: n.entity_id,
          organization_name: n.organization_name || n.label,
          target_name: n.organization_name || n.label,
          organization_type: n.organization_type,
          region: n.region,
          queue_status: n.queue_status || "READY",
          unified_priority_score:
            n.queue_priority_score ||
            n.adaptive_priority_score ||
            n.visual_score ||
            0,
          recommended_action:
            n.recommended_action || "QUEUE_FOR_OUTREACH",
          best_contact_route: n.best_contact_route || null,
          message_subject:
            "Motorcycle Leadership Resource",
          message_body:
            "Hello — I wanted to share a motorcycle leadership and culture resource that may be relevant for your organization. If there is a better contact for this, please let me know."
        }));
      }
    } catch (err) {}

    return [];
  }

  function getSelectedEntityId() {
    return (
      window.BlackDragonBooksSelectionBus?.getDebugState?.()?.selected_entity_id ||
      window.BlackDragonBooksQueueUI?.getDebugState?.()?.selected_entity_id ||
      window.UMBRA_SELECTED_CLIENT_TARGET?.entity_id ||
      null
    );
  }

  function getSelectedItem() {
    const selectedId = getSelectedEntityId();
    const queue = getQueueItems();

    if (selectedId) {
      const hit = queue.find(q => String(q.entity_id) === String(selectedId));
      if (hit) return hit;
    }

    return queue[0] || null;
  }

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function getSubject(item) {
    return normalizeText(
      item?.message_subject ||
      item?.subject ||
      "Motorcycle Leadership Resource"
    );
  }

  function getMessage(item) {
    return normalizeText(
      item?.message_body ||
      item?.message ||
      "Hello — I wanted to share a motorcycle leadership and culture resource that may be relevant for your organization."
    );
  }

  function getContactRoute(item) {
    const route = item?.best_contact_route;

    if (!route) {
      return "NO CONTACT ROUTE AVAILABLE — enrichment needed before outreach.";
    }

    if (typeof route === "string") return route;

    return [
      route.contact_type || route.type || "CONTACT",
      route.value || route.url || route.email || route.phone || ""
    ].filter(Boolean).join(": ");
  }

  function getFullOutreach(item) {
    return [
      "Target: " + (item?.organization_name || item?.target_name || "Unknown Target"),
      "Route: " + getContactRoute(item),
      "",
      "Subject: " + getSubject(item),
      "",
      getMessage(item)
    ].join("\n");
  }

  async function copyText(text, action) {
    const payload = normalizeText(text);

    if (!payload) {
      state.last_error = "No text available to copy.";
      return false;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(payload);
      } else {
        const ta = document.createElement("textarea");
        ta.value = payload;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }

      state.last_action = {
        action,
        copied_at: new Date().toISOString(),
        length: payload.length
      };

      showFeedback(action + " copied");

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      showFeedback("Copy failed");
      return false;
    }
  }

  function showFeedback(message) {
    let el = document.getElementById("blackDragonQueueActionFeedback");

    if (!el) {
      el = document.createElement("div");
      el.id = "blackDragonQueueActionFeedback";
      el.style.position = "fixed";
      el.style.right = "24px";
      el.style.bottom = "86px";
      el.style.zIndex = "999";
      el.style.padding = "10px 14px";
      el.style.border = "1px solid rgba(255,140,42,0.45)";
      el.style.borderRadius = "12px";
      el.style.background = "rgba(5,8,12,0.92)";
      el.style.color = "#fff";
      el.style.fontFamily = "Inter, system-ui, sans-serif";
      el.style.fontSize = "12px";
      el.style.boxShadow = "0 12px 30px rgba(0,0,0,0.35)";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.style.opacity = "1";

    setTimeout(() => {
      el.style.opacity = "0";
    }, 1600);
  }

  function copySubject() {
    const item = getSelectedItem();
    return copyText(getSubject(item), "Subject");
  }

  function copyMessage() {
    const item = getSelectedItem();
    return copyText(getMessage(item), "Message");
  }

  function copyContactRoute() {
    const item = getSelectedItem();
    return copyText(getContactRoute(item), "Contact Route");
  }

  function copyFullOutreach() {
    const item = getSelectedItem();
    return copyText(getFullOutreach(item), "Full Outreach");
  }

  function installButtonBridges() {
    const buttons = Array.from(document.querySelectorAll("button"));

    const map = [
      [/copy subject/i, copySubject],
      [/copy message/i, copyMessage],
      [/copy full outreach/i, copyFullOutreach],
      [/copy contact route/i, copyContactRoute]
    ];

    let patched = 0;

    for (const btn of buttons) {
      const text = btn.textContent || "";
      const match = map.find(([rx]) => rx.test(text));

      if (!match || btn.__bdQueueActionPatched) continue;

      btn.__bdQueueActionPatched = true;

      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        match[1]();
      }, true);

      patched++;
    }

    state.installed = true;

    return patched;
  }

  function installSelectionBridge() {
    document.addEventListener("click", function (ev) {
      const el = ev.target.closest("[data-entity-id], [data-target-id], [data-queue-entity-id]");

      if (!el) return;

      const entityId =
        el.getAttribute("data-entity-id") ||
        el.getAttribute("data-target-id") ||
        el.getAttribute("data-queue-entity-id");

      if (
        entityId &&
        window.BlackDragonBooksSelectionBus &&
        typeof window.BlackDragonBooksSelectionBus.select === "function"
      ) {
        window.BlackDragonBooksSelectionBus.select(entityId, "QUEUE_CLICK");
      }
    }, true);

    return true;
  }

  function install() {
    installButtonBridges();
    installSelectionBridge();

    return getDebugState();
  }

  function getDebugState() {
    const item = getSelectedItem();

    return {
      version: "black_dragon_books_queue_actions_v1",
      installed: state.installed,
      queue_items: getQueueItems().length,
      selected_entity_id: getSelectedEntityId(),
      has_selected_item: !!item,
      selected_item_has_contact_route: !!item?.best_contact_route,
      last_action: state.last_action,
      last_error: state.last_error
    };
  }

  G.install = install;
  G.copySubject = copySubject;
  G.copyMessage = copyMessage;
  G.copyContactRoute = copyContactRoute;
  G.copyFullOutreach = copyFullOutreach;
  G.getSelectedItem = getSelectedItem;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(install, 2500);
  });

  if (document.readyState !== "loading") {
    setTimeout(install, 2500);
  }
})();




