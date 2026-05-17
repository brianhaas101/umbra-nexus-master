// business_licensing_intel.js
// Evaluates legitimacy, maturity, and stability based on registrations and licensing.

export async function analyzeBusinessLicensingIntel(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const yearsInBusiness = raw.yearsInBusiness ?? null;
  const hasActiveLicense = raw.hasActiveLicense ?? null;
  const entityType = raw.entityType ?? null;

  let score = 50;
  const signals = {};
  const notes = [];

  if (yearsInBusiness != null) {
    signals.yearsInBusiness = yearsInBusiness;
    if (yearsInBusiness >= 10) {
      score += 15;
      notes.push("Long-established business (10+ years).");
    } else if (yearsInBusiness >= 3) {
      score += 5;
      notes.push("Established business (3–9 years).");
    } else if (yearsInBusiness < 1) {
      score -= 10;
      notes.push("New business (<1 year) — potential volatility.");
    }
  } else {
    notes.push("No years-in-business data.");
  }

  if (hasActiveLicense === true) {
    score += 10;
    signals.hasActiveLicense = true;
    notes.push("Active license on record.");
  } else if (hasActiveLicense === false) {
    score -= 15;
    signals.hasActiveLicense = false;
    notes.push("No active license found — risk factor.");
  }

  if (entityType) {
    signals.entityType = entityType;
    if (["LLC", "Corporation", "Inc"].includes(entityType)) {
      score += 3;
      notes.push("Registered corporate entity structure.");
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