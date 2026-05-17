// intel_fusion_engine.js
// Orchestrates all core intel modules for a single lead and returns a unified dossier.

import { computeIntelScoreAsync } from "./intel_scoring.js";
import { analyzePropertyIntel } from "./property_intel.js";
import { analyzeBusinessLicensingIntel } from "./business_licensing_intel.js";
import { analyzeLegalFlagsIntel } from "./legal_flags_intel.js";
import { analyzeDemographicOverlay } from "./demographic_overlay.js";
import { analyzeWealthInference } from "./wealth_inference_engine.js";
import { analyzeBehavioralScoring } from "./behavioral_scoring.js";

/**
 * @typedef {Object} LeadInput
 * @property {string} [id]
 * @property {string} [name]
 * @property {string} [businessName]
 * @property {string} [address]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [zip]
 * @property {string} [country]
 * @property {Object} [raw] - enriched metadata from your lead source
 */

/**
 * Run all core intelligence modules for a given lead.
 * @param {LeadInput} lead
 * @param {Object} [options]
 * @returns {Promise<Object>} intelDossier
 */
export async function buildIntelDossierForLead(lead, options = {}) {
  const ctx = {
    lead,
    options
  };

  const [
    propertyResult,
    businessResult,
    legalResult,
    demographicResult,
    wealthResult,
    behaviorResult
  ] = await Promise.all([
    analyzePropertyIntel(ctx),
    analyzeBusinessLicensingIntel(ctx),
    analyzeLegalFlagsIntel(ctx),
    analyzeDemographicOverlay(ctx),
    analyzeWealthInference(ctx),
    analyzeBehavioralScoring(ctx)
  ]);

  const components = {
    property: propertyResult?.score ?? 0,
    business: businessResult?.score ?? 0,
    legal: legalResult?.score ?? 0,
    demographic: demographicResult?.score ?? 0,
    wealth: wealthResult?.score ?? 0,
    behavior: behaviorResult?.score ?? 0
  };

  const urgency =
    behaviorResult?.meta?.urgency || wealthResult?.meta?.urgency || 0;
  const risk =
    legalResult?.meta?.risk ||
    wealthResult?.meta?.risk ||
    behaviorResult?.meta?.risk ||
    0;

  const scoreSummary = await computeIntelScoreAsync({
    components,
    urgency,
    risk
  });

  return {
    leadId: lead.id || null,
    leadName: lead.businessName || lead.name || null,
    components,
    modules: {
      property: propertyResult,
      business: businessResult,
      legal: legalResult,
      demographic: demographicResult,
      wealth: wealthResult,
      behavior: behaviorResult
    },
    score: scoreSummary,
    meta: {
      generatedAt: new Date().toISOString()
    }
  };
}