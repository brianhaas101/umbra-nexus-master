export default function CenterWorkspace() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          border: "2px solid #1e3a5f",
          background:
            "radial-gradient(circle at center, #102033 0%, #09111b 70%)",
          boxShadow: "0 0 120px rgba(59,130,246,0.15)",
        }}
      />

      <div
        style={{
          position: "absolute",
          color: "#93c5fd",
          fontSize: "22px",
          fontWeight: 600,
          letterSpacing: "0.12em",
        }}
      >
        GLOBAL OPERATIONS WORKSPACE
      </div>
    </div>
  );
}