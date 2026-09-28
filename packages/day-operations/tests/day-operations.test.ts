import { describe, it, expect } from 'vitest';
import {
  createRing,
  assignDivision,
  setRingStatus,
  createRingRole,
  createJudgeAssignment,
  validateNoOverlap,
  createScheduleSlot,
  generateSchedule,
} from '../src/index.js';

describe('Ring', () => {
  it('creates an idle Ring', () => {
    const ring = createRing({
      id: 'ring-1',
      tournamentId: 't1',
      label: 'Ring 1',
      locationNotes: 'Main Floor',
    });
    expect(ring.status).toBe('idle');
    expect(ring.label).toBe('Ring 1');
  });

  it('assigns a Division to a Ring', () => {
    const ring = createRing({
      id: 'ring-2',
      tournamentId: 't1',
      label: 'Ring 2',
    });
    const assigned = assignDivision(ring, 'd1');
    expect(assigned.divisionId).toBe('d1');
  });

  it('sets ring status', () => {
    const ring = createRing({
      id: 'ring-3',
      tournamentId: 't1',
      label: 'Ring 3',
      divisionId: 'd1',
    });
    const active = setRingStatus(ring, 'active');
    expect(active.status).toBe('active');
  });
});

describe('RingRole', () => {
  it('creates a RingRole (timekeeper, scorekeeper)', () => {
    const tk = createRingRole({
      id: 'rr-1',
      ringId: 'ring-1',
      role: 'timekeeper',
      assignedPersonId: 'p1',
      window: { startMs: 1000 },
    });
    expect(tk.role).toBe('timekeeper');

    const sk = createRingRole({
      id: 'rr-2',
      ringId: 'ring-1',
      role: 'scorekeeper',
      assignedPersonId: 'p2',
      window: { startMs: 2000 },
    });
    expect(sk.role).toBe('scorekeeper');
  });
});

describe('JudgeAssignment', () => {
  it('creates a JudgeAssignment with center or corner role', () => {
    const center = createJudgeAssignment({
      id: 'ja-1',
      tournamentId: 't1',
      personId: 'j1',
      ringId: 'ring-1',
      divisionId: 'd1',
      role: 'center',
      window: { startMs: 1000 },
    });
    expect(center.role).toBe('center');
    expect(center.status).toBe('proposed');

    const corner = createJudgeAssignment({
      id: 'ja-2',
      tournamentId: 't1',
      personId: 'j2',
      ringId: 'ring-1',
      role: 'corner',
      panelSeat: 1,
      window: { startMs: 1000 },
    });
    expect(corner.role).toBe('corner');
    expect(corner.panelSeat).toBe(1);
  });

  it('validateNoOverlap stub always returns true (deprecated)', () => {
    const assignment = createJudgeAssignment({
      id: 'ja-3',
      tournamentId: 't1',
      personId: 'j3',
      ringId: 'ring-2',
      role: 'center',
      window: { startMs: 1000 },
    });
    expect(validateNoOverlap(assignment, [])).toBe(true);
    expect(validateNoOverlap(assignment, ['c1', 'c2'])).toBe(true);
  });
});

describe('Schedule', () => {
  it('creates a ScheduleSlot (deprecated stub)', () => {
    const slot = createScheduleSlot({
      id: 'ss-1',
      tournamentId: 't1',
      divisionId: 'd1',
      ringId: 'ring-1',
      startTime: new Date('2026-03-15T09:00:00'),
      estimatedDurationMin: 45,
      sequenceOrder: 1,
    });
    expect(slot.status).toBe('scheduled');
    expect(slot.sequenceOrder).toBe(1);
  });

  it('generateSchedule stub returns empty (M1 deferred)', () => {
    const slots = generateSchedule(
      't1',
      [
        { id: 'd1', rankTier: '4th_5th_degree' },
        { id: 'd2', rankTier: 'color_belt' },
      ],
      [{ id: 'ring-1' }, { id: 'ring-2' }],
      new Date('2026-03-15T08:00:00'),
    );
    expect(slots).toEqual([]);
  });
});
