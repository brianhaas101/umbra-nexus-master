const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const locks = {
  version:
    "black_dragon_southern_california_corridor_lock_registry_v1",

  generated_at:
    new Date().toISOString(),

  corridor:
    "SOUTHERN_CALIFORNIA",

  lock_policy: {
    lock_required_for_city_refresh: true,
    lock_required_for_federation_rebuild: true,
    stale_lock_timeout_minutes: 45,
    no_city_runtime_collision: true,
    no_federation_rebuild_during_city_mutation: true
  },

  locks: [
    {
      lock_id: "SOCAL_LOCK_LONG_BEACH_REFRESH",
      scope: "CITY_REFRESH",
      city: "Long Beach",
      active: false
    },
    {
      lock_id: "SOCAL_LOCK_LOS_ANGELES_REFRESH",
      scope: "CITY_REFRESH",
      city: "Los Angeles",
      active: false
    },
    {
      lock_id: "SOCAL_LOCK_SAN_DIEGO_REFRESH",
      scope: "CITY_REFRESH",
      city: "San Diego",
      active: false
    },
    {
      lock_id: "SOCAL_LOCK_FEDERATION_REBUILD",
      scope: "FEDERATION_REBUILD",
      city: "FEDERATION",
      active: false
    },
    {
      lock_id: "SOCAL_LOCK_CLIENT_DELTA_FEED",
      scope: "CLIENT_DELTA_FEED",
      city: "FEDERATION",
      active: false
    }
  ],

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/automation/locks/corridor_lock_registry.json"
);

fs.writeFileSync(out, JSON.stringify(locks, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CORRIDOR_LOCK_REGISTRY_COMPLETE",
  locks: locks.locks.length,
  output: out
}, null, 2));
