// property_intel.js
// Evaluates property-related signals: ownership, value, stability, remodel activity.

export async function analyzePropertyIntel(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const propertyValue = raw.estimatedPropertyValue ?? null;
  const hasRecentRemodel = !!raw.recentRemodel;
  const isOwnerOccupied = raw.isOwnerOccupied ?? null;

  let score = 50;
  const signals = {};
  const notes = [];

  if (propertyValue != null) {
    signals.estimatedPropertyValue = propertyValue;
    if (propertyValue > 750000) {
      score += 20;
      notes.push("High property value.");
    } else if (propertyValue > 400000) {
      score += 10;
      notes.push("Moderate-high property value.");
    } else if (propertyValue < 200000) {
      score -= 10;
      notes.push("Low property value region.");
    }
  } else {
    notes.push("No property value data; using neutral baseline.");
  }

  if (hasRecentRemodel) {
    score += 10;
    signals.recentRemodel = true;
    notes.push("Recent remodel — indicates recent investment.");
  }

  if (isOwnerOccupied === true) {
    score += 5;
    signals.isOwnerOccupied = true;
    notes.push("Owner-occupied property — high decision power on-site.");
  } else if (isOwnerOccupied === false) {
    signals.isOwnerOccupied = false;
    notes.push("Non-owner-occupied — likely investor or landlord.");
  }

  score = Math.max(0, Math.min(score, 100));

  return {
    score,
    signals,
    notes,
    meta: {}
  };
}