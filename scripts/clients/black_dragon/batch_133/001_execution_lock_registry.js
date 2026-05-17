const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const locks = {
  version: "black_dragon_production_execution_lock_registry_v1",
  generated_at: new Date().toISOString(),

  purpose:
    "Prevent overlapping autonomous production jobs and unsafe runtime mutation.",

  lock_policy: {
    lock_required_before_runner_execution: true,
    stale_lock_timeout_minutes: 45,
    concurrent_city_mutation_forbidden: true,
    concurrent_contact_route_mutation_forbidden: true,
    runtime_write_requires_lock: true,
    snapshot_write_requires_lock: true
  },

  locks: [
    {
      lock_id: "BD_LOCK_LONG_BEACH_RUNTIME_MUTATION",
      scope: "CITY_RUNTIME",
      city: "Long Beach",
      state: "CA",
      active: false,
      owner: null,
      acquired_at: null,
      expires_at: null
    },
    {
      lock_id: "BD_LOCK_LONG_BEACH_DISCOVERY",
      scope: "DISCOVERY",
      city: "Long Beach",
      state: "CA",
      active: false,
      owner: null,
      acquired_at: null,
      expires_at: null
    },
    {
      lock_id: "BD_LOCK_LONG_BEACH_REVALIDATION",
      scope: "REVALIDATION",
      city: "Long Beach",
      state: "CA",
      active: false,
      owner: null,
      acquired_at: null,
      expires_at: null
    },
    {
      lock_id: "BD_LOCK_LONG_BEACH_RERANK",
      scope: "RERANK",
      city: "Long Beach",
      state: "CA",
      active: false,
      owner: null,
      acquired_at: null,
      expires_at: null
    }
  ],

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/locks/execution_lock_registry.json"
);

fs.writeFileSync(out, JSON.stringify(locks, null, 2), "utf8");

console.log(JSON.stringify({
  status: "EXECUTION_LOCK_REGISTRY_COMPLETE",
  locks: locks.locks.length,
  output: out
}, null, 2));
