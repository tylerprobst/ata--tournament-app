/**
 * Cross-module stub contracts.
 * Core Reg supplies competitor / judge pools.
 * Day Ops emits RingStartLockSignal → Bracket Ring locks the bracket.
 * Day Ops / Director builds AdjustClosedRingRequest → Bracket Ring AuditLog.
 *
 * Types aligned with @ata/bracket-ring contracts.
 */

/** Competitor identity as seen by Day Ops (opaque id + display). */
export interface CompetitorRef {
  id: string;
  displayName: string;
}

/**
 * Pool of competitors for a Division (Core Reg owns Registration).
 * Day Ops consumes this for check-in / ring call; does not own payment.
 */
export interface DivisionCompetitorPool {
  tournamentId: string;
  divisionId: string;
  eventType: string;
  competitors: CompetitorRef[];
}

/**
 * Judge pool intake from Core Reg Registration flags.
 * willing + preferredRole feed JudgeAssignment; assignment targets RING not device.
 */
export interface JudgePoolEntry {
  personId: string;
  displayName: string;
  tournamentId: string;
  /** Registration flag: willing to judge. */
  willing: boolean;
  preferredRole: 'center' | 'corner';
}

/**
 * Day Ops signals ring start → Bracket Ring must lock the bracket.
 * Callers invoke the lock handler once when RingOperations transitions to active.
 * Shape must stay compatible with @ata/bracket-ring RingStartLockSignal.
 */
export interface RingStartLockSignal {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  bracketId: string;
  /** Epoch ms when ring started (local tournament clock). */
  startedAtMs: number;
}

export type RingStartLockHandler = (signal: RingStartLockSignal) => void;

/**
 * Day Ops / Director path for adjusting a closed ring.
 * Bracket Ring writes AuditLog only for this action (required reason).
 * Shape must stay compatible with @ata/bracket-ring AdjustClosedRingRequest.
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
