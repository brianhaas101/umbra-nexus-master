const fs = require("fs");
const path = require("path");

const file =
  "public/globe/clients/black_dragon/books/response_logging_ui.js";

const abs = path.resolve(file);
let src = fs.readFileSync(abs, "utf8");

if (!src.includes("BlackDragonBooksResponseStore")) {
  src += `

/* =========================================================
   BATCH 055 — LOCAL RESPONSE PERSISTENCE BRIDGE
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
`;
}

fs.writeFileSync(abs, src);

console.log(JSON.stringify({
  status: "RESPONSE_LOGGING_UI_PERSISTENCE_BRIDGE_PATCHED",
  file
}, null, 2));
