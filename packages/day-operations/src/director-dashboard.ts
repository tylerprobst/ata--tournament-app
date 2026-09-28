/**
 * DirectorDashboard stubs — active/queued rings, non-competing judge bench,
 * closed-ring reopen that builds AdjustClosedRingRequest (reason required).
 * Never a silent second scoring path.
 */

import type {
  AdjustClosedRingHandler,
  AdjustClosedRingRequest,
} from './contracts.js';
import type { Ring } from './ring.js';
import type { JudgeAssignment } from './judge-assignment.js';

export interface RingListItem {
  ring: Ring;
  /** queued = idle/held with division; active = status active */
  queueKind: 'active' | 'queued';
}

export interface BenchJudge {
  personId: string;
  displayName: string;
  preferredRole: 'center' | 'corner';
  /** True when person has no active compete ring assignment. */
  nonCompeting: boolean;
}

export interface ReopenClosedRingInput {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  actorId: string;
  /** Required — Bracket Ring AuditLog rejects empty reason. */
  reason: string;
  beforeSummary: string;
  afterSummary: string;
  entityType: string;
  entityId: string;
}

export class DirectorDashboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DirectorDashboardError';
  }
}

/**
 * In-memory director shell for domain scaffolding.
 */
export class DirectorDashboard {
  private rings: Ring[] = [];
  private bench: BenchJudge[] = [];
  private readonly onAdjustClosedRing?: AdjustClosedRingHandler;

  constructor(opts?: { onAdjustClosedRing?: AdjustClosedRingHandler }) {
    this.onAdjustClosedRing = opts?.onAdjustClosedRing;
  }

  setRings(rings: readonly Ring[]): void {
    this.rings = [...rings];
  }

  setNonCompetingJudgeBench(bench: readonly BenchJudge[]): void {
    this.bench = [...bench];
  }

  /**
   * Active rings first, then queued (idle/held with a division assigned).
   * Pure idle rings without a division are omitted from the queue view.
   */
  listActiveAndQueuedRings(): RingListItem[] {
    const active: RingListItem[] = [];
    const queued: RingListItem[] = [];
    for (const ring of this.rings) {
      if (ring.status === 'active') {
        active.push({ ring, queueKind: 'active' });
      } else if (
        (ring.status === 'idle' || ring.status === 'held') &&
        ring.divisionId
      ) {
        queued.push({ ring, queueKind: 'queued' });
      }
    }
    return [...active, ...queued];
  }

  /** Soft preference source for need-judge alerts. */
  nonCompetingJudgeBench(): BenchJudge[] {
    return this.bench.filter((j) => j.nonCompeting);
  }

  /**
   * Build AdjustClosedRingRequest for Bracket Ring audit path.
   * Reason is required (non-empty after trim).
   */
  reopenClosedRing(input: ReopenClosedRingInput): AdjustClosedRingRequest {
    const reason = input.reason?.trim() ?? '';
    if (!reason) {
      throw new DirectorDashboardError(
        'reopenClosedRing requires a non-empty reason for AdjustClosedRingRequest',
      );
    }
    const request: AdjustClosedRingRequest = {
      tournamentId: input.tournamentId,
      ringId: input.ringId,
      divisionId: input.divisionId,
      actorId: input.actorId,
      reason,
      beforeSummary: input.beforeSummary,
      afterSummary: input.afterSummary,
      entityType: input.entityType,
      entityId: input.entityId,
    };
    this.onAdjustClosedRing?.(request);
    return request;
  }
}

/** Helper: filter assignments that could feed a non-competing bench view. */
export function filterNonCompetingAssignments(
  assignments: readonly JudgeAssignment[],
  competingPersonIds: ReadonlySet<string>,
): JudgeAssignment[] {
  return assignments.filter((a) => !competingPersonIds.has(a.personId));
}
