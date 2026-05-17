const fs = require("fs");
const path = require("path");

const patches = [
  {
    file: "public/globe/clients/black_dragon/books/outreach_queue_ui.js",
    marker: "BATCH_058_QUEUE_SELECTION_BUS_BRIDGE",
    bridge: `

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
`
  },
  {
    file: "public/globe/clients/black_dragon/books/response_logging_ui.js",
    marker: "BATCH_058_RESPONSE_SELECTION_BUS_BRIDGE",
    bridge: `

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
`
  }
];

const report = [];

for (const patch of patches) {
  const abs = path.resolve(patch.file);
  let src = fs.readFileSync(abs, "utf8");
  let changed = false;

  if (!src.includes(patch.marker)) {
    src += patch.bridge;
    fs.writeFileSync(abs, src);
    changed = true;
  }

  report.push({
    file: patch.file,
    changed,
    marker: patch.marker
  });
}

console.log(JSON.stringify({
  status: "SELECTION_BUS_BRIDGES_PATCHED",
  report
}, null, 2));
