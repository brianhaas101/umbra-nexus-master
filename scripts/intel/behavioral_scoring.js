// behavioral_scoring.js
// Evaluates sentiment, responsiveness, and psychological buying posture.

export async function analyzeBehavioralScoring(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const reviewSentiment = raw.reviewSentiment ?? null; // -1 to 1
  const reviewVolume = raw.reviewVolume ?? null;
  const ownerToneScore = raw.ownerToneScore ?? null; // 0–100
  const responsivenessScore = raw.responsivenessScore ?? null; // 0–100
  const complaintFrequency = raw.complaintFrequency ?? null; // 0–1

  let score = 50;
  const signals = {};
  const notes = [];
  let risk = 0;
  let urgency = 0;

  if (reviewSentiment != null) {
    signals.reviewSentiment = reviewSentiment;
    if (reviewSentiment > 0.4) {
      score += 10;
      notes.push("Generally positive review sentiment.");
    } else if (reviewSentiment < -0.2) {
      score -= 10;
      notes.push("Negative review sentiment — risk and stress indication.");
      risk += 0.2;
    }
  }

  if (reviewVolume != null) {
    signals.reviewVolume = reviewVolume;
    if (reviewVolume > 200) {
      score += 8;
      notes.push("High review volume — active customer flow.");
    } else if (reviewVolume < 5) {
      notes.push("Very low review volume — behavioral signal is weak.");
    }
  }

  if (ownerToneScore != null) {
    signals.ownerToneScore = ownerToneScore;
    if (ownerToneScore > 70) {
      score += 5;
      notes.push("Growth-oriented owner language.");
    } else if (ownerToneScore < 30) {
      score -= 5;
      notes.push("Defensive or negative owner language.");
      risk += 0.1;
    }
  }

  if (responsivenessScore != null) {
    signals.responsivenessScore = responsivenessScore;
    if (responsivenessScore > 75) {
      score += 8;
      urgency += 0.2;
      notes.push("Highly responsive — strong engagement potential.");
    } else if (responsivenessScore < 30) {
      score -= 8;
      notes.push("Low responsiveness — may be hard to close.");
    }
  }

  if (complaintFrequency != null) {
    signals.complaintFrequency = complaintFrequency;
    if (complaintFrequency > 0.5) {
      score -= 10;
      risk += 0.2;
      notes.push("High complaint frequency — high friction client profile.");
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