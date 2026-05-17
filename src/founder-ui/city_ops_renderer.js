window.renderCityOpsWorkspace = function renderCityOpsWorkspace() {
  const target = document.getElementById("founderCenterWorkspace");

  if (!target) return;

  target.innerHTML = `
    <div
      style="
        width:100%;
        height:100%;
        position:relative;
        overflow:hidden;
        border-radius:14px;
        background:
          radial-gradient(circle at center, #0f1722 0%, #05070b 100%);
        font-family:Inter,sans-serif;
      "
    >
      <!-- HEADER -->
      <div
        style="
          position:absolute;
          top:18px;
          left:18px;
          right:18px;
          height:54px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 18px;
          background:#081018cc;
          border:1px solid #1e293b;
          border-radius:12px;
          color:#d7e0ea;
        "
      >
        <div>
          <div style="font-size:18px;font-weight:700;color:#93c5fd;">
            CITY OPERATIONS
          </div>

          <div style="font-size:12px;color:#8aa0b8;">
            Spatial intelligence validation workspace
          </div>
        </div>

        <div style="display:flex;gap:16px;font-size:12px;color:#8aa0b8;">
          <div>ACTIVE CITY: NONE</div>
          <div>GEO FAILURES: 0</div>
          <div>PROVENANCE LOCK: ENABLED</div>
        </div>
      </div>

      <!-- MAP SURFACE -->
      <div
        style="
          position:absolute;
          top:92px;
          left:18px;
          right:18px;
          bottom:18px;
          border:1px solid #1e293b;
          border-radius:14px;
          overflow:hidden;
          background:
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px),
            radial-gradient(circle at center, #0d1520 0%, #05070b 100%);
          background-size:40px 40px,40px 40px,100% 100%;
        "
      >
        <!-- MOCK NODE -->
        <div
          style="
            position:absolute;
            top:42%;
            left:48%;
            width:14px;
            height:14px;
            border-radius:50%;
            background:#4ade80;
            box-shadow:0 0 18px #4ade80;
          "
        ></div>

        <!-- NODE LABEL -->
        <div
          style="
            position:absolute;
            top:calc(42% + 18px);
            left:calc(48% + 18px);
            color:#d7e0ea;
            font-size:12px;
            background:#081018dd;
            border:1px solid #1e293b;
            border-radius:8px;
            padding:6px 10px;
          "
        >
          VERIFIED NODE
          <br />
          Spatial Confidence: A
        </div>
      </div>
    </div>
  `;
};