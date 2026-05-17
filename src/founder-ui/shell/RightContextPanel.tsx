export default function RightContextPanel() {
  return (
    <div
      style={{
        padding: "18px",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ color: "#f59e0b", fontWeight: 700 }}>
        ENTITY CONTEXT
      </div>

      <div style={{ color: "#8aa0b8" }}>
        No entity selected.
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "14px" }}>
        <div>Lifecycle: —</div>
        <div>Spatial Confidence: —</div>
        <div>Source Chain: —</div>
        <div>Layer Score: —</div>
        <div>Conflicts: —</div>
      </div>
    </div>
  );
}