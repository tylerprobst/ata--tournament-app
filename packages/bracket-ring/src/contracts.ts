/**
 * Cross-module stub contracts.
 * DivisionCompetitorPool — supplied by Core Reg.
 * RingStartLockSignal / adjustClosedRing — Day Ops plugs into Bracket Ring.
 */

/** Competitor identity as seen by Bracket Ring (opaque id + display). */
export interface BracketCompetitorRef {
  id: string;
  displayName: string;
}

/**
 * Pool of competitors eligible for a sparring Division bracket.
 * Core Reg owns registration; Bracket Ring only consumes this shape.
 */
export interface DivisionCompetitorPool {
  tournamentId: string;
  divisionId: string;
  eventType: string;
  competitors: BracketCompetitorRef[];
}

/**
 * Day Ops signals ring start → Bracket Ring must lock the bracket.
 * Callers invoke `onRingStart` once when the ring transitions to active.
 */
export interface RingStartLockSignal {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  bracketId: string;
  /** Epoch ms when ring started (local tournament clock). */
  startedAtMs: number;
}

/**
 * Day Ops / Director path for adjusting a closed ring.
 * Bracket Ring writes AuditLog only for this action (required reason).
 */
export interface AdjustClosedRingRequest {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  actorId: string;
  reason: string;
  /** Opaque before/after summary for audit. */
  beforeSummary: string;
  afterSummary: string;
  entityType: string;
  entityId: string;
}

export type AdjustClosedRingHandler = (
  request: AdjustClosedRingRequest,
) => void;
