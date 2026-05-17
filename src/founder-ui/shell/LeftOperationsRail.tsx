const sections = [
  "GLOBAL",
  "WAVES",
  "CITY OPS",
  "REVIEW QUEUE",
  "CONFLICTS",
  "INTELLIGENCE",
  "LAYERS",
  "REPLAY",
  "EXPORTS",
];

export default function LeftOperationsRail() {
  return (
    <div
      style={{
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {sections.map((item) => (
        <div
          key={item}
          style={{
            padding: "12px 14px",
            border: "1px solid #1e293b",
            borderRadius: "10px",
            background: "#0f1722",
            color: "#d7e0ea",
            cursor: "pointer",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}