import { requirePass } from "./l01_promotion_gate.js";

function expectFailure(fn) {
  try {
    fn();
    throw new Error("Expected failure did not occur.");
  } catch (err) {
    if (String(err.message).includes("Expected failure")) {
      throw err;
    }
  }
}

requirePass(
  "L01_USASPENDING_LIVE_CONNECTOR_PASS",
  "L01_USASPENDING_LIVE_CONNECTOR_PASS"
);

expectFailure(() => {
  requirePass(
    "FAILED_HTTP_403",
    "L01_FBI_FIELD_OFFICES_LIVE_CONNECTOR_PASS"
  );
});

console.log("L01_PROMOTION_GATE_PASS");
