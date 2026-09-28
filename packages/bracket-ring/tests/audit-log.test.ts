import { describe, it, expect } from 'vitest';
import {
  AuditLog,
  AuditLogError,
  CLOSED_RING_ADJUSTMENT,
} from '../src/audit/audit-log.js';

describe('AuditLog', () => {
  it('accepts closed_ring_adjustment with required reason', () => {
    const log = new AuditLog();
    const entry = log.write({
      actorId: 'director-1',
      entityType: 'Match',
      entityId: 'm-9',
      action: CLOSED_RING_ADJUSTMENT,
      beforeSummary: 'red=3',
      afterSummary: 'red=4',
      reason: 'Director reopen: scorekeeper mis-tap',
    });

    expect(entry.action).toBe('closed_ring_adjustment');
    expect(entry.reason).toContain('mis-tap');
    expect(log.list()).toHaveLength(1);
  });

  it('rejects non-closed-ring actions', () => {
    const log = new AuditLog();
    expect(() =>
      log.write({
        actorId: 'sk-1',
        entityType: 'Match',
        entityId: 'm-1',
        action: 'score_point',
        beforeSummary: '',
        afterSummary: 'red+1',
        reason: 'routine',
      }),
    ).toThrow(AuditLogError);

    expect(() =>
      log.write({
        actorId: 'sk-1',
        entityType: 'Bracket',
        entityId: 'b-1',
        action: 'reorder_slots',
        beforeSummary: '',
        afterSummary: '',
        reason: 'live reorder',
      }),
    ).toThrow(/only accepts action 'closed_ring_adjustment'/);

    expect(log.list()).toHaveLength(0);
  });

  it('rejects closed_ring_adjustment without reason', () => {
    const log = new AuditLog();
    expect(() =>
      log.write({
        actorId: 'director-1',
        entityType: 'Match',
        entityId: 'm-1',
        action: CLOSED_RING_ADJUSTMENT,
        beforeSummary: 'x',
        afterSummary: 'y',
        reason: '   ',
      }),
    ).toThrow(/requires a non-empty reason/);
  });
});
