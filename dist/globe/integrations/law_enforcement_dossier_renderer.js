'use strict';
(function () {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  function renderResolvedDossierPanel(dossier) {
    if (!dossier) return null;
    const target = document.getElementById('umbra-dossier-panel') || null;
    if (!target) return dossier;
    const identity = dossier.identity || {}, contact = dossier.contact_path || {}, opportunity = dossier.opportunity || {}, ctx = dossier.operational_context || {}, scores = dossier.scores || {};
    target.innerHTML = `
      <div class="umbra-dossier-block">
        <h2>${identity.name || 'Unknown organization'}</h2>
        <div><strong>Type:</strong> ${identity.organization_type || 'Unknown'}</div>
        <div><strong>Jurisdiction:</strong> ${identity.jurisdiction || ''}</div>
        <div><strong>Location:</strong> ${identity.city_name || ''}${identity.state ? ', ' + identity.state : ''}</div>
        <div><strong>Phone:</strong> ${contact.phone || ''}</div>
        <div><strong>Email:</strong> ${contact.email || ''}</div>
        <div><strong>Website:</strong> ${contact.website || ''}</div>
        <div><strong>Units:</strong> ${(ctx.units || []).join(', ')}</div>
        <div><strong>Why it fits:</strong> ${opportunity.why_it_fits || ''}</div>
        <div><strong>Recommended action:</strong> ${opportunity.recommended_action || ''}</div>
        <div><strong>Umbra score:</strong> ${scores.umbra_score ?? ''}</div>
      </div>`;
    return dossier;
  }
  G.renderResolvedDossierPanel = renderResolvedDossierPanel;
})();
