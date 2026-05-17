const fs = require("fs");
const path = require("path");

const file =
  path.resolve(
    "public/globe/clients/black_dragon/books/book_citymap_renderer.js"
  );

const txt = fs.readFileSync(file, "utf8");

const audit = {
  version:
    "black_dragon_batch_048_world_scaling_audit_v1",

  generated_at:
    new Date().toISOString(),

  checks: {
    version_updated:
      txt.includes("batch_048"),

    optimization_state_present:
      txt.includes("world_node_limit"),

    mode_detection_present:
      txt.includes("resolveMode"),

    world_mode_present:
      txt.includes("worldModeActive"),

    node_reduction_present:
      txt.includes("shouldRenderDetailedNode"),

    pulse_gating_present:
      txt.includes("shouldRenderPulse"),

    halo_gating_present:
      txt.includes("shouldRenderHalo"),

    world_limit_present:
      txt.includes("world_node_limit: 180"),

    pulse_world_disabled:
      txt.includes("world_pulses_enabled: false"),

    halo_world_disabled:
      txt.includes("world_halos_enabled: false")
  }
};

audit.pass =
  Object.values(audit.checks).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_048_world_scaling_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
