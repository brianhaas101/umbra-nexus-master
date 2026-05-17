// public/globe/scoring.v1.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) {
    console.error("[scoring] UmbraGlobe missing.");
    return;
  }

  const SCORING = {
    VERSION: "v1",

    normalize100(v, fallback = 0) {
      const n = Number(v);
      if (!Number.isFinite(n)) return fallback;
      if (n <= 1.00001) return Math.max(0, Math.min(100, n * 100));
      return Math.max(0, Math.min(100, n));
    },

    normalize01(v, fallback = 1) {
      const n = Number(v);
      if (!Number.isFinite(n)) return fallback;
      if (n > 1.00001) return Math.max(0, Math.min(1, n / 100));
      return Math.max(0, Math.min(1, n));
    },

    daysOldFromMeta(entity) {
      const ts =
        entity?.meta?.updatedAt ??
        entity?.meta?.createdAt ??
        entity?._src?.loadedAt ??
        null;

      if (!ts) return null;

      const then = Date.parse(ts);
      if (!Number.isFinite(then)) return null;

      const now = Date.now();
      const diffMs = Math.max(0, now - then);
      return diffMs / 86400000;
    },

    applyConfidence(value, confidence01) {
      const c = this.normalize01(confidence01, 1);
      return value * (0.5 + 0.5 * c);
    },

    applyRecency(value, daysOld) {
      if (!Number.isFinite(daysOld)) return value;
      const decay = Math.exp(-daysOld / 90);
      return value * decay;
    },

    computeEntityScore(entity) {
      const baseUmbra = this.normalize100(entity?.scores?.umbraScore, 0);
      const founder = this.normalize100(entity?.scores?.founderScore, baseUmbra);
      const confidence01 = this.normalize01(entity?.scores?.confidence, 1);
      const daysOld = this.daysOldFromMeta(entity);

      // Preserve current system truth:
      // base runtime score comes from canonical entity.scores.umbraScore
      const baseScore = baseUmbra;

      // Minor founder influence only when present.
      // This keeps current scoring stable instead of replacing it.
      const founderDelta =
        Number.isFinite(Number(entity?.scores?.founderScore))
          ? (founder - baseUmbra) * 0.15
          : 0;

      const preConfidence = this.normalize100(baseScore + founderDelta, 0);
      const confidenceAdjusted = this.applyConfidence(preConfidence, confidence01);
      const recencyAdjusted = this.applyRecency(confidenceAdjusted, daysOld);
      const finalScore = this.normalize100(recencyAdjusted, 0);

      const trace = {
        version: this.VERSION,
        inputs: {
          baseUmbraScore: baseUmbra,
          founderScore: Number.isFinite(Number(entity?.scores?.founderScore)) ? founder : null,
          confidence01,
          daysOld: Number.isFinite(daysOld) ? Number(daysOld.toFixed(3)) : null
        },
        stages: {
          baseScore,
          founderDelta: Number(founderDelta.toFixed(4)),
          preConfidence: Number(preConfidence.toFixed(4)),
          confidenceAdjusted: Number(confidenceAdjusted.toFixed(4)),
          recencyAdjusted: Number(recencyAdjusted.toFixed(4)),
          finalScore
        },
        policy: {
          source: "entity.scores",
          baseField: "scores.umbraScore",
          founderInfluenceWeight: 0.15,
          confidenceRule: "value * (0.5 + 0.5 * confidence)",
          recencyRule: "exp(-daysOld / 90)"
        }
      };

      return {
        umbraScore: finalScore,
        trace
      };
    }
  };

  G.scoring = SCORING;

  G.applyScoring = function applyScoring(dataset) {
    if (!dataset || !Array.isArray(dataset.entities)) {
      console.error("[scoring] invalid dataset");
      return;
    }

    for (const ent of dataset.entities) {
      const res = SCORING.computeEntityScore(ent);
      ent.umbraScore = res.umbraScore;
      ent._scoreTrace = res.trace;

      // Keep canonical nested score in sync so downstream consumers
      // that still read entity.scores.umbraScore remain deterministic.
      ent.scores = ent.scores && typeof ent.scores === "object" ? ent.scores : {};
      ent.scores.umbraScore = res.umbraScore;
    }

    console.log("[scoring] applied to", dataset.entities.length, "entities");
  };

  console.log("[scoring] LOADED");
})();