/**
 * ScheduleSlot ordering — high-degree-first; color belts after noon milestone.
 * Plan only; live drift via RingOperations / DirectorDashboard.
 */

/**
 * Rank tiers by degree (not dan naming).
 * Morning priority: fourth_fifth > second_third > first > color_belt.
 */
export type RankTier =
  | 'color_belt'
  | 'first_degree'
  | 'second_third_degree'
  | 'fourth_fifth_degree';

/** Lower number = earlier in the day (morning priority). */
export const RANK_TIER_PRIORITY: Record<RankTier, number> = {
  fourth_fifth_degree: 0,
  second_third_degree: 1,
  first_degree: 2,
  color_belt: 3,
};

export type ScheduleSlotStatus =
  | 'scheduled'
  | 'called'
  | 'running'
  | 'done';

export interface ScheduleSlot {
  id: string;
  tournamentId: string;
  divisionId: string;
  ringId: string;
  rankTier: RankTier;
  /** Planned start as local HH:mm (24h), e.g. "09:30". */
  startLocalTime: string;
  /** Optional planned end or duration minutes. */
  endLocalTime?: string;
  estimatedDurationMinutes?: number;
  sequenceOrder: number;
  status: ScheduleSlotStatus;
}

export interface OrderScheduleSlotsOptions {
  /**
   * Local-time noon milestone as "HH:mm" (default "12:00").
   * Color-belt slots are queued at/after this milestone.
   */
  noonMilestoneLocal?: string;
}

const DEFAULT_NOON = '12:00';

/** Parse "HH:mm" to minutes since midnight. */
export function localTimeToMinutes(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new ScheduleError(`Invalid local time: ${hhmm}`);
  }
  return h * 60 + m;
}

/**
 * Order ScheduleSlots: higher RankTier earlier; color_belt after noon milestone.
 * Stable within the same priority band by existing sequenceOrder then id.
 */
export function orderScheduleSlotsHighDegreeFirst(
  slots: readonly ScheduleSlot[],
  opts: OrderScheduleSlotsOptions = {},
): ScheduleSlot[] {
  const noon = opts.noonMilestoneLocal ?? DEFAULT_NOON;
  const noonMinutes = localTimeToMinutes(noon);

  const sorted = [...slots].sort((a, b) => {
    const aColor = a.rankTier === 'color_belt';
    const bColor = b.rankTier === 'color_belt';

    if (aColor !== bColor) {
      return aColor ? 1 : -1;
    }

    if (!aColor && !bColor) {
      const pri =
        RANK_TIER_PRIORITY[a.rankTier] - RANK_TIER_PRIORITY[b.rankTier];
      if (pri !== 0) return pri;
    }

    if (aColor && bColor) {
      const aMin = localTimeToMinutes(a.startLocalTime);
      const bMin = localTimeToMinutes(b.startLocalTime);
      const aAfter = aMin >= noonMinutes ? 0 : 1;
      const bAfter = bMin >= noonMinutes ? 0 : 1;
      if (aAfter !== bAfter) return aAfter - bAfter;
    }

    if (a.sequenceOrder !== b.sequenceOrder) {
      return a.sequenceOrder - b.sequenceOrder;
    }
    return a.id.localeCompare(b.id);
  });

  return sorted.map((slot, index) => ({
    ...slot,
    sequenceOrder: index,
    startLocalTime:
      slot.rankTier === 'color_belt' &&
      localTimeToMinutes(slot.startLocalTime) < noonMinutes
        ? noon
        : slot.startLocalTime,
  }));
}

export class ScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleError';
  }
}

/**
 * Deprecated stub: Create a ScheduleSlot (M1).
 * Use full ScheduleSlot interface directly.
 */
export function createScheduleSlot(params: {
  id: string;
  tournamentId: string;
  divisionId: string;
  ringId: string;
  startTime?: Date;
  estimatedDurationMin?: number;
  sequenceOrder: number;
}): Partial<ScheduleSlot> {
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    divisionId: params.divisionId,
    ringId: params.ringId,
    sequenceOrder: params.sequenceOrder,
    status: 'scheduled',
  };
}

/**
 * Deprecated stub: Placeholder for schedule generation (M1).
 */
export function generateSchedule(
  _tournamentId: string,
  _divisions: { id: string; rankTier: string }[],
  _rings: { id: string }[],
  _startTime: Date,
): ScheduleSlot[] {
  return [];
}
