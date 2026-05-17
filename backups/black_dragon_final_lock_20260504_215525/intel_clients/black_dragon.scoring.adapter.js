// public/globe/intel/clients/black_dragon.scoring.adapter.js

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const config = window.UmbraIntel.clients.blackDragon;
  const signals = window.UmbraIntel.clients.blackDragonSignals;

  if (!config || !signals) {
    console.error("[black_dragon.scoring.adapter] Missing config or signal definitions.");
    return;
  }

  const SOFT_DISQUALIFIERS = new Set([
    "no_contact_path",
    "wrong_role"
  ]);

  const TRUE_HARD_REJECTS = new Set([
    "non_law_enforcement",
    "outside_us",
    "outside_united_states",
    "civilian_general_public",
    "motorcycle_club_or_biker_association",
    "private_security_without_law_enforcement_training_role"
  ]);

  const SCORE_SCALE = 18;

  function clampNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getAgencySizeBonus(entity) {
    const size = clampNumber(
      entity?.agency_size || entity?.agencySize || entity?.officers,
      0
    );

    const bonus = config.scoring.agency_size_bonus || {};

    if (size >= 1000) return clampNumber(bonus.officers_1000_plus);
    if (size >= 300) return clampNumber(bonus.officers_300_999);
    if (size >= 100) return clampNumber(bonus.officers_100_299);
    if (size >= 50) return clampNumber(bonus.officers_50_99);

    return clampNumber(bonus.unknown);
  }

  function getGeographyBonus(entity) {
    const state = String(
      entity?.state || entity?.location?.state || ""
    ).toUpperCase();

    const geo = config.target_profile?.geography || {};
    const bonus = config.scoring.geography_bonus || {};

    if (geo.tier_1_states?.includes(state)) {
      return clampNumber(bonus.tier_1_state);
    }

    if (geo.tier_2_states?.includes(state)) {
      return clampNumber(bonus.tier_2_state);
    }

    return clampNumber(bonus.other_state);
  }

  function getContactBonus(entity) {
    const email = String(entity?.email || entity?.contact?.email || "").trim();
    const phone = String(entity?.phone || entity?.contact?.phone || "").trim();

    const hasEmail = Boolean(email);
    const hasPhone = Boolean(phone);

    const contactBonus = config.scoring.contact_quality_bonus || {};

    if (hasEmail && hasPhone) {
      return clampNumber(contactBonus.verified_work_email_and_phone);
    }

    if (hasEmail) {
      return clampNumber(contactBonus.verified_work_email_only);
    }

    if (hasPhone) {
      return clampNumber(contactBonus.phone_only);
    }

    return -1.5;
  }

  function getSignalScore(entity) {
    const entitySignals = entity?.signals || {};

    let score = 0;
    let signalCount = 0;

    Object.values(signals.top_signals || {}).forEach((signal) => {
      if (entitySignals[signal.signal_id] === true) {
        score += clampNumber(signal.weight);
        signalCount += 1;
      }
    });

    Object.values(signals.supporting_signals || {}).forEach((signal) => {
      if (entitySignals[signal.signal_id] === true) {
        score += clampNumber(signal.weight);
        signalCount += 1;
      }
    });

    const baseSignalScore = score * 2.5;

    let densityBonus = 0;
    if (signalCount >= 8) densityBonus = 3;
    else if (signalCount >= 6) densityBonus = 2;
    else if (signalCount >= 4) densityBonus = 1;

    return {
      signalScore: baseSignalScore + densityBonus,
      baseSignalScore,
      signalCount,
      densityBonus
    };
  }

  function normalizeDisqualifiers(entity) {
    return Array.isArray(entity?.disqualifiers)
      ? entity.disqualifiers.map((d) => String(d).trim()).filter(Boolean)
      : [];
  }

  function hasTrueHardReject(disqualifiers) {
    return disqualifiers.some((d) => {
      if (TRUE_HARD_REJECTS.has(d)) return true;

      const def = signals.disqualifiers?.[d];

      if (!def?.hard_reject) return false;
      if (SOFT_DISQUALIFIERS.has(d)) return false;

      return true;
    });
  }

  function getDisqualifierPenalty(entity) {
    const disqualifiers = normalizeDisqualifiers(entity);

    if (hasTrueHardReject(disqualifiers)) {
      return clampNumber(
        config.scoring.disqualifier_penalties?.hard_reject,
        -1000
      );
    }

    let penalty = 0;

    disqualifiers.forEach((d) => {
      if (d === "no_contact_path") penalty -= 1;
      else if (d === "wrong_role") penalty -= 1.25;
      else if (d === "non_law_enforcement") penalty -= 1000;
      else penalty -= 3;
    });

    return penalty;
  }

  function getConfidenceMultiplier(entity) {
    const confidence = clampNumber(entity?.confidence, 0.8);
    const multiplier = config.scoring.confidence_multiplier || {};

    if (confidence >= 0.95) return clampNumber(multiplier.official_source_confirmed, 1);
    if (confidence >= 0.85) return clampNumber(multiplier.multiple_sources_confirmed, 1);
    if (confidence >= 0.7) return clampNumber(multiplier.single_reputable_source, 1);
    if (confidence >= 0.55) return clampNumber(multiplier.inferred_match, 1);

    return clampNumber(multiplier.weak_or_stale_match, 1);
  }

  function classify(score) {
    const n = clampNumber(score, 0);

    if (n >= 75) return "HOT";
    if (n >= 45) return "WARM";
    return "COLD";
  }

  function scoreEntity(entity) {
    if (!entity || typeof entity !== "object") return entity;

    const signalResult = getSignalScore(entity);
    const signalScore = signalResult.signalScore;

    const agencySizeBonus = getAgencySizeBonus(entity);
    const geographyBonus = getGeographyBonus(entity);
    const contactBonus = getContactBonus(entity);
    const disqualifierPenalty = getDisqualifierPenalty(entity);
    const confidenceMultiplier = getConfidenceMultiplier(entity);

    let rawScore =
      signalScore +
      agencySizeBonus +
      geographyBonus +
      contactBonus +
      disqualifierPenalty;

    if (rawScore <= -900) rawScore = 0;
    rawScore = Math.max(0, rawScore);

    const finalScore = Number(
      Math.min(100, rawScore * SCORE_SCALE * confidenceMultiplier).toFixed(3)
    );

    entity.scores = entity.scores || {};
    entity.scores.umbraScore = finalScore;
    entity.scores.blackDragonScore = finalScore;

    entity.umbraScore = finalScore;
    entity.tier = classify(finalScore);

    entity._scoreTrace = entity._scoreTrace || {};
    entity._scoreTrace.blackDragon = {
      signalScore,
      baseSignalScore: signalResult.baseSignalScore,
      signalCount: signalResult.signalCount,
      densityBonus: signalResult.densityBonus,
      agencySizeBonus,
      geographyBonus,
      contactBonus,
      disqualifierPenalty,
      confidenceMultiplier,
      rawScore,
      finalScore,
      tier: entity.tier
    };

    return entity;
  }

  function scoreEntities(entities) {
    if (!Array.isArray(entities)) return [];

    return entities
      .map(scoreEntity)
      .sort((a, b) =>
        clampNumber(b?.scores?.blackDragonScore) -
        clampNumber(a?.scores?.blackDragonScore)
      );
  }

  window.UmbraIntel.adapters.blackDragonScoring = Object.freeze({
    scoreEntity,
    scoreEntities,
    classify
  });

  console.info("[black_dragon.scoring.adapter] Ready.");
})();