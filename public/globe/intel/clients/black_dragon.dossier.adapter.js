// public/globe/intel/clients/black_dragon.dossier.adapter.js
// Black Dragon Dossier Adapter
// Purpose: format normalized + scored Black Dragon leads into dossier-ready objects without mutating core dossier logic.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const config = window.UmbraIntel.clients.blackDragon;
  const signalDefs = window.UmbraIntel.clients.blackDragonSignals;

  if (!config || !signalDefs) {
    console.error("[black_dragon.dossier.adapter] Missing config or signal definitions.");
    return;
  }

  function clean(value, fallback = "—") {
    const s = String(value ?? "").trim();
    return s || fallback;
  }

  function scoreOf(entity) {
    return Number(
      entity?.scores?.blackDragonScore ??
      entity?.scores?.umbraScore ??
      entity?.umbraScore ??
      0
    );
  }

  function getActiveSignals(entity) {
    const signals = entity?.signals || {};
    const active = [];

    Object.values(signalDefs.top_signals).forEach((signal) => {
      if (signals[signal.signal_id] === true) {
        active.push({
          type: "top",
          id: signal.signal_id,
          label: signal.label,
          weight: signal.weight
        });
      }
    });

    Object.values(signalDefs.supporting_signals).forEach((signal) => {
      if (signals[signal.signal_id] === true) {
        active.push({
          type: "supporting",
          id: signal.signal_id,
          label: signal.label,
          weight: signal.weight
        });
      }
    });

    return active.sort((a, b) => Number(b.weight || 0) - Number(a.weight || 0));
  }

  function getSignalSummary(entity) {
    if (Array.isArray(entity?.signals_summary) && entity.signals_summary.length) {
      return entity.signals_summary;
    }

    return getActiveSignals(entity).map((signal) => signal.label);
  }

  function getContactStatus(entity) {
    const hasEmail = Boolean(clean(entity?.email, ""));
    const hasPhone = Boolean(clean(entity?.phone, ""));

    if (hasEmail && hasPhone) return "Complete: email + phone";
    if (hasEmail) return "Partial: email only";
    if (hasPhone) return "Partial: phone only";
    return "Incomplete: no contact path";
  }

  function getPriorityReason(entity) {
    const activeSignals = getActiveSignals(entity);

    if (!activeSignals.length) {
      return "Lead retained by target fit, but no strong intent signal has been detected yet.";
    }

    const top = activeSignals[0];

    return `${top.label}. This is the strongest detected prioritization reason for outreach.`;
  }

  function buildDossier(entity) {
    if (!entity || typeof entity !== "object") return null;

    const score = scoreOf(entity);
    const activeSignals = getActiveSignals(entity);
    const signalSummary = getSignalSummary(entity);

    const dossier = {
      dossier_type: "black_dragon_lead",
      client_id: config.client_id,
      client_name: config.client_name,

      identity: {
        entity_id: clean(entity.entity_id),
        agency_id: clean(entity.agency_id),
        full_name: clean(entity.full_name),
        title: clean(entity.title),
        agency_name: clean(entity.agency_name),
        agency_type: clean(entity.agency_type),
        state: clean(entity.state),
        country: clean(entity.country, "US")
      },

      contact: {
        email: clean(entity.email),
        phone: clean(entity.phone),
        status: getContactStatus(entity)
      },

      qualification: {
        tier: clean(entity.tier, "COLD"),
        umbraScore: score,
        blackDragonScore: score,
        confidence: Number(entity.confidence ?? 0.8),
        priority_reason: getPriorityReason(entity),
        recommended_outreach_angle: clean(
          entity.recommended_outreach_angle,
          "Lead with specialized OMG certification training, reduced travel friction, and agency-level training value."
        )
      },

      signals: {
        active: activeSignals,
        summary: signalSummary,
        disqualifiers: Array.isArray(entity.disqualifiers) ? entity.disqualifiers : []
      },

      source: {
        source_name: clean(entity.source_name),
        source_url: clean(entity.source_url),
        source_date: clean(entity.source_date),
        source_text: clean(entity.source_text)
      },

      offer_context: {
        product_name: config.offer.product_name,
        seat_price_usd: config.offer.primary_price_per_seat_usd,
        expected_deal_range_usd: config.offer.expected_deal_values_usd,
        likely_sales_cycle_days: config.offer.expected_sales_cycle_days
      }
    };

    entity.dossier = Object.assign({}, entity.dossier || {}, dossier);
    return dossier;
  }

  function buildDossiers(entities) {
    if (!Array.isArray(entities)) return [];
    return entities.map(buildDossier).filter(Boolean);
  }

  window.UmbraIntel.adapters.blackDragonDossier = Object.freeze({
    buildDossier,
    buildDossiers,
    getActiveSignals,
    getSignalSummary
  });

  console.info("[black_dragon.dossier.adapter] Ready.");
})();