/**
 * ScheduleSlot ordering — high-degree-first; color belts after noon milestone.
 * Plan only; live drift via RingOperations / DirectorDashboard.
 */

export type RankTier =
  | 'color_belt'
  | 'first_degree'
  | 'second_third_degree'
  | 'fourth_fifth_degree';

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
  startLocalTime: string;
  endLocalTime?: string;
  estimatedDurationMinutes?: number;
  sequenceOrder: number;
  status: ScheduleSlotStatus;
}

export interface OrderScheduleSlotsOptions {
  noonMilestoneLocal?: string;
}

const DEFAULT_NOON = '12:00';

export function localTimeToMinutes(hhmm: string): number {
  const parts = hhmm.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1] ?? 0);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    throw new ScheduleError(`Invalid local time: ${hhmm}`);
  }
  return h * 60 + m;
}

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
