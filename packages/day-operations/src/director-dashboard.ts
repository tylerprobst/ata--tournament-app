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
  queueKind: 'active' | 'queued';
}

export interface BenchJudge {
  personId: string;
  displayName: string;
  preferredRole: 'center' | 'corner';
  nonCompeting: boolean;
}

export interface ReopenClosedRingInput {
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

export class DirectorDashboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DirectorDashboardError';
  }
}

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

  nonCompetingJudgeBench(): BenchJudge[] {
    return this.bench.filter((j) => j.nonCompeting);
  }

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

export function filterNonCompetingAssignments(
  assignments: readonly JudgeAssignment[],
  competingPersonIds: ReadonlySet<string>,
): JudgeAssignment[] {
  return assignments.filter((a) => !competingPersonIds.has(a.personId));
}
