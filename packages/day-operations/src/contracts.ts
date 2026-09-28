/**
 * Cross-module stub contracts.
 * Core Reg supplies competitor / judge pools.
 * Day Ops emits RingStartLockSignal → Bracket Ring locks the bracket.
 * Day Ops / Director builds AdjustClosedRingRequest → Bracket Ring AuditLog.
 *
 * Types aligned with /workspace/ata-bracket-ring/src/contracts.ts
 * (local duplicated stubs — do not npm-link unless clean).
 */

export interface CompetitorRef {
  id: string;
  displayName: string;
}

export interface DivisionCompetitorPool {
  tournamentId: string;
  divisionId: string;
  eventType: string;
  competitors: CompetitorRef[];
}

export interface JudgePoolEntry {
  personId: string;
  displayName: string;
  tournamentId: string;
  willing: boolean;
  preferredRole: 'center' | 'corner';
}

export interface RingStartLockSignal {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  bracketId: string;
  startedAtMs: number;
}

export type RingStartLockHandler = (signal: RingStartLockSignal) => void;

export interface AdjustClosedRingRequest {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  actorId: string;
  reason: string;
  beforeSummary: string;
  afterSummary: string;
  entityType: string;
  entityId: string;
}

export type AdjustClosedRingHandler = (
  request: AdjustClosedRingRequest,
) => void;
