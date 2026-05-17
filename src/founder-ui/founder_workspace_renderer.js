const workspaceContent = {
  GLOBAL: {
    title: "GLOBAL OPERATIONS WORKSPACE",
    subtitle: "Globe-level operational overview. Black Dragon runtime remains isolated underneath.",
  },
  CITY: {
    title: "CITY OPS WORKSPACE",
    subtitle: "Accurate city map, node placement, provenance, and spatial confidence review surface.",
  },
  REVIEW: {
    title: "REVIEW QUEUE",
    subtitle: "Pending entities, conflicts, source gaps, geocode failures, and manual verification tasks.",
  },
  CONFLICTS: {
    title: "CONFLICT RESOLUTION",
    subtitle: "Entity merge disputes, location mismatches, duplicate records, and source contradictions.",
  },
  AUDIT: {
    title: "AUDIT REPLAY",
    subtitle: "Deterministic replay timeline, promotion gates, runtime integrity, and rollback checkpoints.",
  },
  LAYERS: {
    title: "INTELLIGENCE LAYERS",
    subtitle: "12-layer intelligence status, source coverage, scoring contribution, and readiness state.",
  },
};

window.FOUNDER_MODE_STATE = window.FOUNDER_MODE_STATE || {
  activeMode: "GLOBAL",
};

window.renderFounderWorkspace = function renderFounderWorkspace(mode) {
  const target = document.getElementById("founderCenterWorkspace");
  const label = document.getElementById("founderModeLabel");

  const content = workspaceContent[mode] || workspaceContent.GLOBAL;

  window.FOUNDER_MODE_STATE.activeMode = mode;

  if (label) {
    label.textContent = mode;
  }

  if (!target) {
    console.warn("[FounderUI] founderCenterWorkspace missing");
    return;
  }

  target.innerHTML = `
    <div style="
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      color:#d7e0ea;
      font-family:Inter,sans-serif;
      pointer-events:none;
    ">
      <div>
        <div style="
          color:#93c5fd;
          font-size:26px;
          font-weight:700;
          letter-spacing:0.1em;
          margin-bottom:12px;
        ">
          ${content.title}
        </div>

        <div style="
          color:#8aa0b8;
          font-size:14px;
          max-width:620px;
          line-height:1.5;
        ">
          ${content.subtitle}
        </div>
      </div>
    </div>
  `;

  console.log("[FounderUI] Workspace rendered:", mode);
};

window.setFounderMode = function setFounderMode(mode) {
  window.renderFounderWorkspace(mode);
};