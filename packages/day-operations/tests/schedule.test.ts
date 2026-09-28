import { describe, it, expect } from 'vitest';
import {
  orderScheduleSlotsHighDegreeFirst,
  type ScheduleSlot,
  type RankTier,
} from '../src/schedule.js';

function slot(
  id: string,
  rankTier: RankTier,
  startLocalTime: string,
  sequenceOrder = 0,
): ScheduleSlot {
  return {
    id,
    tournamentId: 't1',
    divisionId: `div-${id}`,
    ringId: 'ring-1',
    rankTier,
    startLocalTime,
    sequenceOrder,
    status: 'scheduled',
  };
}

describe('orderScheduleSlotsHighDegreeFirst', () => {
  it('orders higher RankTier earlier (morning priority)', () => {
    const slots = [
      slot('color', 'color_belt', '13:00', 0),
      slot('first', 'first_degree', '10:00', 1),
      slot('2nd3rd', 'second_third_degree', '09:30', 2),
      slot('4th5th', 'fourth_fifth_degree', '09:00', 3),
    ];

    const ordered = orderScheduleSlotsHighDegreeFirst(slots);
    expect(ordered.map((s) => s.rankTier)).toEqual([
      'fourth_fifth_degree',
      'second_third_degree',
      'first_degree',
      'color_belt',
    ]);
    expect(ordered.map((s) => s.sequenceOrder)).toEqual([0, 1, 2, 3]);
  });

  it('places color_belt after noon milestone (default 12:00)', () => {
    const slots = [
      slot('cb-early', 'color_belt', '10:00', 0),
      slot('cb-late', 'color_belt', '14:00', 1),
      slot('black', 'first_degree', '09:00', 2),
    ];

    const ordered = orderScheduleSlotsHighDegreeFirst(slots);
    expect(ordered[0]!.rankTier).toBe('first_degree');
    expect(ordered[1]!.id).toBe('cb-late');
    expect(ordered[2]!.id).toBe('cb-early');
    expect(ordered[2]!.startLocalTime).toBe('12:00');
  });

  it('honors configurable noon milestone', () => {
    const slots = [
      slot('cb', 'color_belt', '11:00', 0),
      slot('first', 'first_degree', '09:00', 1),
    ];

    const ordered = orderScheduleSlotsHighDegreeFirst(slots, {
      noonMilestoneLocal: '11:00',
    });
    expect(ordered[0]!.rankTier).toBe('first_degree');
    expect(ordered[1]!.rankTier).toBe('color_belt');
    expect(ordered[1]!.startLocalTime).toBe('11:00');
  });
});
