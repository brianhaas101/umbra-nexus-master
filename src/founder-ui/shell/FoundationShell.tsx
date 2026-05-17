import TopCommandBar from "./TopCommandBar";
import LeftOperationsRail from "./LeftOperationsRail";
import RightContextPanel from "./RightContextPanel";
import BottomTelemetryBar from "./BottomTelemetryBar";
import CenterWorkspace from "../workspace/CenterWorkspace";

export default function FoundationShell() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr 340px",
        gridTemplateRows: "72px 1fr 42px",
        background: "#05070b",
        color: "#d7e0ea",
        overflow: "hidden",
      }}
    >
      {/* Top */}
      <div
        style={{
          gridColumn: "1 / 4",
          borderBottom: "1px solid #18202b",
          background: "#0b1118",
        }}
      >
        <TopCommandBar />
      </div>

      {/* Left Rail */}
      <div
        style={{
          borderRight: "1px solid #18202b",
          background: "#081017",
        }}
      >
        <LeftOperationsRail />
      </div>

      {/* Center */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, #0f1722 0%, #05070b 100%)",
        }}
      >
        <CenterWorkspace />
      </div>

      {/* Right Panel */}
      <div
        style={{
          borderLeft: "1px solid #18202b",
          background: "#0b1118",
        }}
      >
        <RightContextPanel />
      </div>

      {/* Bottom */}
      <div
        style={{
          gridColumn: "1 / 4",
          borderTop: "1px solid #18202b",
          background: "#081017",
        }}
      >
        <BottomTelemetryBar />
      </div>
    </div>
  );
}