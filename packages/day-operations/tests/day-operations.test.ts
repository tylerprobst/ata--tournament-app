import { describe, it, expect } from 'vitest';
import {
  createRing,
  assignDivision,
  startRing,
  RingError,
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
      location: 'Main Floor',
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
    expect(assigned.currentDivisionId).toBe('d1');
  });

  it('starts a Ring (transitions to active)', () => {
    const ring = createRing({
      id: 'ring-3',
      tournamentId: 't1',
      label: 'Ring 3',
    });
    const assigned = assignDivision(ring, 'd1');
    const started = startRing(assigned);
    expect(started.status).toBe('active');
  });

  it('cannot start Ring without assigned Division', () => {
    const ring = createRing({
      id: 'ring-4',
      tournamentId: 't1',
      label: 'Ring 4',
    });
    expect(() => startRing(ring)).toThrow(RingError);
    expect(() => startRing(ring)).toThrow(/without assigned Division/);
  });

  it('cannot reassign Division while active', () => {
    const ring = createRing({
      id: 'ring-5',
      tournamentId: 't1',
      label: 'Ring 5',
    });
    const assigned = assignDivision(ring, 'd1');
    const started = startRing(assigned);
    expect(() => assignDivision(started, 'd2')).toThrow(RingError);
    expect(() => assignDivision(started, 'd2')).toThrow(/while active/);
  });
});

describe('RingRole', () => {
  it('creates a RingRole (timekeeper, scorekeeper)', () => {
    const tk = createRingRole({
      id: 'rr-1',
      ringId: 'ring-1',
      roleType: 'timekeeper',
      assignedPersonId: 'p1',
      assignedPersonName: 'John Timer',
    });
    expect(tk.roleType).toBe('timekeeper');

    const sk = createRingRole({
      id: 'rr-2',
      ringId: 'ring-1',
      roleType: 'scorekeeper',
      assignedPersonId: 'p2',
      assignedPersonName: 'Jane Score',
    });
    expect(sk.roleType).toBe('scorekeeper');
  });
});

describe('JudgeAssignment', () => {
  it('creates a JudgeAssignment with center or corner role', () => {
    const center = createJudgeAssignment({
      id: 'ja-1',
      tournamentId: 't1',
      personId: 'j1',
      personName: 'Alice Judge',
      ringId: 'ring-1',
      divisionId: 'd1',
      role: 'center',
    });
    expect(center.role).toBe('center');
    expect(center.status).toBe('assigned');

    const corner = createJudgeAssignment({
      id: 'ja-2',
      tournamentId: 't1',
      personId: 'j2',
      personName: 'Bob Judge',
      ringId: 'ring-1',
      role: 'corner',
      panelPosition: 0,
    });
    expect(corner.role).toBe('corner');
    expect(corner.panelPosition).toBe(0);
  });

  it('validateNoOverlap stub always returns true (M1)', () => {
    const assignment = createJudgeAssignment({
      id: 'ja-3',
      tournamentId: 't1',
      personId: 'j3',
      personName: 'Charlie Judge',
      ringId: 'ring-2',
      role: 'center',
    });
    // M1 stub: always valid (full check deferred)
    expect(validateNoOverlap(assignment, [])).toBe(true);
    expect(validateNoOverlap(assignment, ['c1', 'c2'])).toBe(true);
  });
});

describe('Schedule', () => {
  it('creates a ScheduleSlot', () => {
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
    expect(slot.estimatedDurationMin).toBe(45);
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
    // M1 stub: empty (full scheduler with high-rank-first deferred)
    expect(slots).toEqual([]);
  });
});
