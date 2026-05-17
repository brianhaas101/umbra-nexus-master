export default function TopCommandBar() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#f59e0b",
          }}
        >
          UMBRA NEXUS
        </div>

        <div style={{ color: "#8aa0b8" }}>
          ACTIVE WAVE: WAVE-001
        </div>

        <div style={{ color: "#4ade80" }}>
          REPLAY: PASS
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px" }}>
        <div style={{ color: "#93c5fd" }}>GLOBAL</div>
        <div style={{ color: "#93c5fd" }}>CITY OPS</div>
        <div style={{ color: "#93c5fd" }}>REVIEW</div>
        <div style={{ color: "#93c5fd" }}>AUDIT</div>
      </div>
    </div>
  );
}