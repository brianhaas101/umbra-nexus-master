// intel_scoring.js
// Umbra Nexus – Intelligence Scoring Engine

import { loadIntelWeights } from "./intel_config_loader.js";

export const DEFAULT_WEIGHTS = {
  property: 20,
  business: 20,
  legal: 15,
  demographic: 15,
  wealth: 15,
  behavior: 15
};

export const DEFAULT_MODIFIERS = {
  urgencyBoostMax: 10,
  riskPenaltyMax: 15
};

/**
 * Normalize a component score to 0–1.
 * Accepts null/undefined by treating them as 0 (unknown).
 */
export function normalizeScore(score, max = 100) {
  if (score == null || Number.isNaN(score)) return 0;
  const clamped = Math.max(0, Math.min(score, max));
  return clamped / max;
}

/**
 * Compute base weighted score from module outputs, loading weights from config if needed.
 * @param {Object} components - { property, business, legal, demographic, wealth, behavior }
 * @param {Object} [weights]
 * @returns {Promise<number>} baseScore 0–100
 */
export async function computeBaseIntelScoreAsync(components, weights) {
  const {
    property = 0,
    business = 0,
    legal = 0,
    demographic = 0,
    wealth = 0,
    behavior = 0
  } = components;

  const configWeights = weights || (await loadIntelWeights()) || DEFAULT_WEIGHTS;
  const w = { ...DEFAULT_WEIGHTS, ...configWeights };

  const normalized = {
    property: normalizeScore(property),
    business: normalizeScore(business),
    legal: normalizeScore(legal),
    demographic: normalizeScore(demographic),
    wealth: normalizeScore(wealth),
    behavior: normalizeScore(behavior)
  };

  const totalWeight =
    w.property +
    w.business +
    w.legal +
    w.demographic +
    w.wealth +
    w.behavior;

  if (totalWeight === 0) return 0;

  const weightedSum =
    normalized.property * w.property +
    normalized.business * w.business +
    normalized.legal * w.legal +
    normalized.demographic * w.demographic +
    normalized.wealth * w.wealth +
    normalized.behavior * w.behavior;

  const baseScore = (weightedSum / totalWeight) * 100;
  return Math.round(baseScore);
}

/**
 * Apply urgency & risk modifiers.
 * @param {number} baseScore - 0–100
 * @param {Object} options
 * @param {number} [options.urgency=0] - 0–1 (0 none, 1 maximum)
 * @param {number} [options.risk=0] - 0–1 (0 no risk, 1 maximum risk)
 * @param {Object} [options.modifiers]
 * @returns {{ finalScore: number, adjustments: { urgencyBoost: number, riskPenalty: number } }}
 */
export function applyModifiers(baseScore, options = {}) {
  const { urgency = 0, risk = 0, modifiers = {} } = options;
  const m = { ...DEFAULT_MODIFIERS, ...modifiers };

  const urgencyClamped = Math.max(0, Math.min(urgency, 1));
  const riskClamped = Math.max(0, Math.min(risk, 1));

  const urgencyBoost = urgencyClamped * m.urgencyBoostMax;
  const riskPenalty = riskClamped * m.riskPenaltyMax;

  let finalScore = baseScore + urgencyBoost - riskPenalty;
  finalScore = Math.max(0, Math.min(finalScore, 100));

  return {
    finalScore: Math.round(finalScore),
    adjustments: {
      urgencyBoost: Math.round(urgencyBoost),
      riskPenalty: Math.round(riskPenalty)
    }
  };
}

/**
 * Full async score computation: components -> base score -> modifiers -> final score.
 * @param {Object} params
 * @param {Object} params.components - component scores
 * @param {Object} [params.weights]
 * @param {number} [params.urgency]
 * @param {number} [params.risk]
 * @param {Object} [params.modifiers]
 * @returns {Promise<{ baseScore: number, finalScore: number, adjustments: { urgencyBoost: number, riskPenalty: number } }>}
 */
export async function computeIntelScoreAsync({
  components,
  weights,
  urgency = 0,
  risk = 0,
  modifiers
}) {
  const baseScore = await computeBaseIntelScoreAsync(components, weights);
  const { finalScore, adjustments } = applyModifiers(baseScore, {
    urgency,
    risk,
    modifiers
  });

  return {
    baseScore,
    finalScore,
    adjustments
  };
}