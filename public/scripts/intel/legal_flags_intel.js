// legal_flags_intel.js
// Evaluates legal and financial stress: liens, bankruptcies, frequent disputes.

export async function analyzeLegalFlagsIntel(ctx) {
  const { lead } = ctx;
  const raw = lead.raw || {};

  const liensCount = raw.liensCount ?? 0;
  const bankruptcies = raw.bankruptcies ?? 0;
  const legalDisputes = raw.legalDisputes ?? 0;

  let score = 70; // start higher, subtract for problems
  const signals = {};
  const notes = [];
  let risk = 0;

  if (liensCount > 0) {
    signals.liensCount = liensCount;
    score -= liensCount * 5;
    notes.push(`Liens on record: ${liensCount}.`);
  }

  if (bankruptcies > 0) {
    signals.bankruptcies = bankruptcies;
    score -= bankruptcies * 15;
    notes.push(`Bankruptcies on record: ${bankruptcies}.`);
  }

  if (legalDisputes > 0) {
    signals.legalDisputes = legalDisputes;
    score -= legalDisputes * 3;
    notes.push(`Legal disputes on record: ${legalDisputes}.`);
  }

  const totalFlags = liensCount + bankruptcies + legalDisputes;
  if (totalFlags > 0) {
    const maxFlags = 10;
    risk = Math.min(totalFlags / maxFlags, 1);
    notes.push("Legal/financial flags present — increased risk.");
  }

  score = Math.max(0, Math.min(score, 100));

  return {
    score,
    signals,
    notes,
    meta: {
      risk
    }
  };
}