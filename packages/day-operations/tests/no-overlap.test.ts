import { describe, it, expect } from 'vitest';
import {
  noOverlap,
  assignFromJudgePool,
  JudgeAssignmentError,
} from '../src/judge-assignment.js';
import type { JudgePoolEntry } from '../src/contracts.js';

describe('noOverlap', () => {
  it('returns false when judge ring is still a compete ring', () => {
    expect(noOverlap('p1', ['ring-a', 'ring-b'], 'ring-a')).toBe(false);
  });

  it('returns true when judge ring is not among compete rings', () => {
    expect(noOverlap('p1', ['ring-a', 'ring-b'], 'ring-c')).toBe(true);
  });

  it('returns true when compete list is empty', () => {
    expect(noOverlap('p1', [], 'ring-a')).toBe(true);
  });
});

describe('assignFromJudgePool', () => {
  const willing: JudgePoolEntry = {
    personId: 'p1',
    displayName: 'Pat',
    tournamentId: 't1',
    willing: true,
    preferredRole: 'corner',
  };

  it('assigns willing judge to RING (not device) using preferredRole', () => {
    const a = assignFromJudgePool(willing, {
      id: 'ja-1',
      ringId: 'ring-3',
      divisionId: 'div-1',
      window: { startMs: 0 },
    });
    expect(a.ringId).toBe('ring-3');
    expect(a.role).toBe('corner');
    expect(a.status).toBe('assigned');
  });

  it('rejects non-willing pool entry', () => {
    expect(() =>
      assignFromJudgePool(
        { ...willing, willing: false },
        { id: 'ja-2', ringId: 'ring-3', window: { startMs: 0 } },
      ),
    ).toThrow(JudgeAssignmentError);
  });
});
