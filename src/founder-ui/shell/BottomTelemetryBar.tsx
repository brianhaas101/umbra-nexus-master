export default function BottomTelemetryBar() {
  return (
    <div
      style={{
        height: "100%",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        color: "#8aa0b8",
      }}
    >
      <span>INGEST: IDLE</span>
      <span>GEOCODE FAILURES: 0</span>
      <span>CONFLICTS: 0</span>
      <span>EXPORT LOCK: ENABLED</span>
      <span>BLACK DRAGON: ISOLATED</span>
    </div>
  );
}