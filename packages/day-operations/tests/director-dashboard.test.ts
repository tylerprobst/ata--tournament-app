import { describe, it, expect } from 'vitest';
import {
  DirectorDashboard,
  DirectorDashboardError,
} from '../src/director-dashboard.js';
import { createRing } from '../src/ring.js';
import type { AdjustClosedRingRequest } from '../src/contracts.js';

describe('DirectorDashboard', () => {
  it('listActiveAndQueuedRings returns active then queued', () => {
    const dash = new DirectorDashboard();
    dash.setRings([
      createRing({ id: 'r-idle', tournamentId: 't1', label: 'Ring 1' }),
      {
        ...createRing({
          id: 'r-q',
          tournamentId: 't1',
          label: 'Ring 2',
          divisionId: 'd2',
        }),
        status: 'held',
      },
      {
        ...createRing({
          id: 'r-a',
          tournamentId: 't1',
          label: 'Ring 3',
          divisionId: 'd3',
        }),
        status: 'active',
      },
    ]);

    const list = dash.listActiveAndQueuedRings();
    expect(list.map((i) => i.ring.id)).toEqual(['r-a', 'r-q']);
    expect(list[0]!.queueKind).toBe('active');
    expect(list[1]!.queueKind).toBe('queued');
  });

  it('nonCompetingJudgeBench filters competing judges', () => {
    const dash = new DirectorDashboard();
    dash.setNonCompetingJudgeBench([
      {
        personId: 'p1',
        displayName: 'A',
        preferredRole: 'center',
        nonCompeting: true,
      },
      {
        personId: 'p2',
        displayName: 'B',
        preferredRole: 'corner',
        nonCompeting: false,
      },
    ]);
    expect(dash.nonCompetingJudgeBench().map((j) => j.personId)).toEqual([
      'p1',
    ]);
  });

  it('reopenClosedRing builds AdjustClosedRingRequest with required reason', () => {
    const captured: AdjustClosedRingRequest[] = [];
    const dash = new DirectorDashboard({
      onAdjustClosedRing: (req) => captured.push(req),
    });

    const req = dash.reopenClosedRing({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      actorId: 'director-1',
      reason: 'Score entry typo after close',
      beforeSummary: 'P=5',
      afterSummary: 'P=4',
      entityType: 'ScoreEntry',
      entityId: 'se-9',
    });

    expect(req.reason).toBe('Score entry typo after close');
    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual(req);
    expect(Object.keys(req).sort()).toEqual(
      [
        'actorId',
        'afterSummary',
        'beforeSummary',
        'divisionId',
        'entityId',
        'entityType',
        'reason',
        'ringId',
        'tournamentId',
      ].sort(),
    );
  });

  it('reopenClosedRing rejects empty / whitespace reason', () => {
    const dash = new DirectorDashboard();
    expect(() =>
      dash.reopenClosedRing({
        tournamentId: 't1',
        ringId: 'r1',
        divisionId: 'd1',
        actorId: 'director-1',
        reason: '   ',
        beforeSummary: 'a',
        afterSummary: 'b',
        entityType: 'Match',
        entityId: 'm1',
      }),
    ).toThrow(DirectorDashboardError);
  });
});
