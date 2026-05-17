/*
  UMBRA NEXUS — Layer 12
  Audit Replay and Convergence Lock
  Isolated. Deterministic. No Black Dragon imports.
*/

const REQUIRED_LAYERS = Object.freeze([
  "layer_01",
  "layer_02",
  "layer_03",
  "layer_04",
  "layer_05",
  "layer_06",
  "layer_07",
  "layer_08",
  "layer_09",
  "layer_10",
  "layer_11"
]);

const REJECTED_FIELDS = Object.freeze([
  "runtime_promotion",
  "manual_convergence_override",
  "black_dragon_runtime_reference",
  "synthetic_replay_hash"
]);

export function processLayer12(input) {
  for (const field of REJECTED_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return output(input, "blocked_runtime_or_manual_override", null, [], [`rejected_field_present:${field}`]);
    }
  }

  const layers = input?.layers || {};
  const missingLayers = REQUIRED_LAYERS.filter(layerId => layers[layerId] === undefined || layers[layerId] === null);

  if (missingLayers.length > 0) {
    return output(input, "blocked_missing_layers", null, missingLayers, ["required_layer_output_missing"]);
  }

  const replayHash = makeReplayHash({
    record_id: input?.record_id || null,
    entity_key: input?.entity_key || null,
    city_key: input?.city_key || null,
    layers: stableSortObject(layers)
  });

  return output(input, "converged_locked", replayHash, [], []);
}

function output(input, status, replayHash, missingLayers, blockedReasons) {
  return Object.freeze({
    layer_id: "layer_12",
    record_id: input?.record_id || null,
    entity_key: input?.entity_key || null,
    city_key: input?.city_key || null,
    convergence_status: status,
    replay_hash: replayHash,
    missing_layers: Object.freeze(missingLayers || []),
    blocked_reasons: Object.freeze(blockedReasons || []),
    audit_timestamp: new Date().toISOString()
  });
}

function stableSortObject(value) {
  if (Array.isArray(value)) {
    return value.map(stableSortObject);
  }

  if (value && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = stableSortObject(value[key]);
    }
    return sorted;
  }

  return value;
}

function makeReplayHash(value) {
  const basis = JSON.stringify(stableSortObject(value));
  let hash = 2166136261;

  for (let i = 0; i < basis.length; i++) {
    hash ^= basis.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `replay_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
