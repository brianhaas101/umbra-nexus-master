Layer 12 performs audit replay and convergence locking.

It checks that Layers 01 through 11 are present.
It rejects runtime promotion.
It rejects manual convergence overrides.
It rejects synthetic replay hashes.
It does not generate new claims.
It does not mutate prior layer outputs.
It does not use Black Dragon runtime, data, assets, loaders, tunnels, or telemetry.

A converged record receives:
- convergence_status: converged_locked
- deterministic replay_hash
- empty missing_layers
- empty blocked_reasons
