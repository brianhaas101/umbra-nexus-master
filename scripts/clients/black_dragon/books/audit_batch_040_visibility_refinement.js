const fs = require("fs");
const path = require("path");

const rendererPath = path.resolve(
  "public/globe/clients/black_dragon/books/book_citymap_renderer.js"
);

const renderer = fs.readFileSync(rendererPath, "utf8");

const audit = {
  version: "black_dragon_books_batch_040_visibility_refinement_audit_v1",
  generated_at: new Date().toISOString(),

  renderer_integrity: {
    batch_040_loaded:
      renderer.includes("batch_040"),

    pulse_loop_present:
      renderer.includes("startPulseLoop"),

    halo_mesh_present:
      renderer.includes("haloMesh"),

    pulse_mesh_present:
      renderer.includes("pulseMesh"),

    layered_rendering_present:
      renderer.includes("group.add(built.haloMesh)") &&
      renderer.includes("group.add(built.pulseMesh)") &&
      renderer.includes("group.add(built.baseMesh)"),

    intensity_color_logic_present:
      renderer.includes("CRITICAL") &&
      renderer.includes("HIGH") &&
      renderer.includes("MEDIUM"),

    animation_timer_present:
      renderer.includes("setInterval"),

    scene_resolver_present:
      renderer.includes("resolveScene")
  }
};

audit.pass =
  Object.values(audit.renderer_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_040_visibility_refinement_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
