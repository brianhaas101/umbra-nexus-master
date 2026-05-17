// demographic_overlay.js
// Evaluates the surrounding area's income, stability, and density.

export async function analyzeDemographicOverlay(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const medianIncome = raw.areaMedianIncome ?? null;
  const populationDensity = raw.populationDensity ?? null;
  const homeownershipRate = raw.homeownershipRate ?? null;

  let score = 50;
  const signals = {};
  const notes = [];

  if (medianIncome != null) {
    signals.areaMedianIncome = medianIncome;
    if (medianIncome >= 90000) {
      score += 15;
      notes.push("High-income area.");
    } else if (medianIncome >= 60000) {
      score += 7;
      notes.push("Moderate-income area.");
    } else if (medianIncome <= 35000) {
      score -= 10;
      notes.push("Low-income area.");
    }
  } else {
    notes.push("No median income data.");
  }

  if (populationDensity != null) {
    signals.populationDensity = populationDensity;
    if (populationDensity > 5000) {
      score += 5;
      notes.push("High density — more potential customers.");
    } else if (populationDensity < 500) {
      score -= 5;
      notes.push("Very low density — limited local volume.");
    }
  }

  if (homeownershipRate != null) {
    signals.homeownershipRate = homeownershipRate;
    if (homeownershipRate > 0.7) {
      score += 5;
      notes.push("High homeownership — more stable, long-term customers.");
    }
  }

  score = Math.max(0, Math.min(score, 100));

  return {
    score,
    signals,
    notes,
    meta: {}
  };
}