import { describe, it, expect } from 'vitest';
import { RingOperations, RingOpsError } from '../src/ring-operations.js';
import type { RingStartLockSignal } from '../src/contracts.js';

describe('RingOperations', () => {
  it('walks check_in_ready → called → need_judge → hosting_wizard → active', () => {
    const ops = new RingOperations({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      bracketId: 'b1',
      nowMs: () => 1_700_000_000_000,
    });

    expect(ops.getPhase()).toBe('check_in_ready');
    ops.callDivision();
    expect(ops.getPhase()).toBe('called');
    ops.signalNeedJudge();
    expect(ops.getPhase()).toBe('need_judge');
    ops.hostWizard();
    expect(ops.getPhase()).toBe('hosting_wizard');
    ops.startRing('sparring');
    expect(ops.getPhase()).toBe('active');
    expect(ops.getActiveMode()).toBe('sparring');
  });

  it('on transition to active emits RingStartLockSignal shape for Bracket Ring', () => {
    const emitted: RingStartLockSignal[] = [];
    const ops = new RingOperations({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      bracketId: 'bracket-42',
      nowMs: () => 1_700_000_000_123,
      onRingStart: (sig) => emitted.push(sig),
    });

    ops.callDivision();
    ops.hostWizard();
    const signal = ops.startRing('forms');

    expect(emitted).toHaveLength(1);
    expect(signal).toEqual({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      bracketId: 'bracket-42',
      startedAtMs: 1_700_000_000_123,
    });
    expect(Object.keys(signal).sort()).toEqual(
      ['bracketId', 'divisionId', 'ringId', 'startedAtMs', 'tournamentId'].sort(),
    );
    expect(ops.getLastLockSignal()).toEqual(signal);
    expect(ops.getActiveMode()).toBe('forms');
  });

  it('supports next_pair → end → reopen_stub path', () => {
    const ops = new RingOperations({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      bracketId: 'b1',
    });
    ops.callDivision();
    ops.hostWizard();
    ops.startRing('sparring');
    ops.nextPair();
    expect(ops.getPhase()).toBe('next_pair');
    ops.endRing();
    expect(ops.getPhase()).toBe('ended');
    ops.reopenStub();
    expect(ops.getPhase()).toBe('reopen_stub');
  });

  it('rejects invalid transitions', () => {
    const ops = new RingOperations({
      tournamentId: 't1',
      ringId: 'r1',
      divisionId: 'd1',
      bracketId: 'b1',
    });
    expect(() => ops.startRing('sparring')).toThrow(RingOpsError);
  });
});
