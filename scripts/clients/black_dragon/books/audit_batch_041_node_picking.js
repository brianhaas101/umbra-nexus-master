const fs = require("fs");
const path = require("path");

const rendererPath = path.resolve(
  "public/globe/clients/black_dragon/books/book_citymap_renderer.js"
);

const renderer = fs.readFileSync(rendererPath, "utf8");

const audit = {
  version: "black_dragon_books_batch_041_node_picking_audit_v1",
  generated_at: new Date().toISOString(),

  renderer_integrity: {
    batch_041_loaded:
      renderer.includes("batch_041"),

    raycaster_present:
      renderer.includes("Raycaster"),

    pointer_present:
      renderer.includes("Vector2"),

    click_binding_present:
      renderer.includes('addEventListener("click"'),

    hover_binding_present:
      renderer.includes('addEventListener("mousemove"'),

    sync_selection_present:
      renderer.includes("function syncSelection"),

    selection_event_present:
      renderer.includes("umbra:blackDragonBookTargetSelected"),

    selected_global_present:
      renderer.includes("UMBRA_SELECTED_CLIENT_TARGET"),

    select_by_entity_present:
      renderer.includes("selectByEntityId"),

    emphasis_present:
      renderer.includes("emphasizeSelected")
  }
};

audit.pass =
  Object.values(audit.renderer_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_041_node_picking_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
