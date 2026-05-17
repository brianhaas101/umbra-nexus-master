export type FounderWorkspaceMode =
  | "global"
  | "city"
  | "review"
  | "audit"
  | "entity";

export type SpatialConfidenceClass =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E";

export type EntityLifecycleState =
  | "DISCOVERED"
  | "INGESTED"
  | "NORMALIZED"
  | "GEO_VALIDATED"
  | "VERIFIED"
  | "SCORED"
  | "REVIEWED"
  | "PROMOTED"
  | "REJECTED"
  | "ARCHIVED";

export interface FounderUiState {
  mode: FounderWorkspaceMode;

  activeWaveId: string;

  activeCityId: string | null;

  selectedEntityId: string | null;

  unresolvedConflictCount: number;

  geocodeFailureCount: number;

  replayIntegrity: "PASS" | "WARN" | "FAIL";

  exportLocked: boolean;
}

export const initialFounderUiState: FounderUiState = {
  mode: "global",

  activeWaveId: "WAVE-001",

  activeCityId: null,

  selectedEntityId: null,

  unresolvedConflictCount: 0,

  geocodeFailureCount: 0,

  replayIntegrity: "PASS",

  exportLocked: true,
};