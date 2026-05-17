// wealth_inference_engine.js
// Infers wealth and liquidity from assets, region, remodeling, and proxies.

export async function analyzeWealthInference(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const propertyValue = raw.estimatedPropertyValue ?? null;
  const fleetEstimate = raw.fleetEstimatedValue ?? null;
  const luxurySignalScore = raw.luxurySignalScore ?? null; // 0–100
  const refinanceRecent = !!raw.recentRefinance;
  const highEndRetailProximity = raw.highEndRetailProximity ?? null; // 0–1

  let score = 50;
  const signals = {};
  const notes = [];
  let risk = 0;
  let urgency = 0;

  if (propertyValue != null) {
    signals.estimatedPropertyValue = propertyValue;
    if (propertyValue > 900000) {
      score += 20;
      notes.push("Very high property value.");
    } else if (propertyValue > 500000) {
      score += 10;
      notes.push("High property value.");
    }
  } else {
    notes.push("No property value data for wealth inference.");
  }

  if (fleetEstimate != null) {
    signals.fleetEstimatedValue = fleetEstimate;
    if (fleetEstimate > 250000) {
      score += 10;
      notes.push("High-value fleet or equipment.");
    } else if (fleetEstimate < 30000) {
      score -= 5;
      notes.push("Limited fleet value.");
    }
  }

  if (luxurySignalScore != null) {
    signals.luxurySignalScore = luxurySignalScore;
    if (luxurySignalScore > 70) {
      score += 10;
      notes.push("Strong luxury consumption signals.");
    } else if (luxurySignalScore < 30) {
      score -= 5;
      notes.push("Low luxury signal.");
    }
  }

  if (refinanceRecent) {
    signals.recentRefinance = true;
    notes.push("Recent refinance — possible increased liquidity or stress.");
    risk += 0.2;
    urgency += 0.2;
  }

  if (highEndRetailProximity != null) {
    signals.highEndRetailProximity = highEndRetailProximity;
    if (highEndRetailProximity > 0.7) {
      score += 5;
      notes.push("Close to high-end retail clusters.");
    }
  }

  risk = Math.min(risk, 1);
  urgency = Math.min(urgency, 1);
  score = Math.max(0, Math.min(score, 100));

  return {
    score,
    signals,
    notes,
    meta: {
      risk,
      urgency
    }
  };
}