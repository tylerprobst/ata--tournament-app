/**
 * ScheduleSlot — places a Division (and its Ring) on the tournament timeline.
 * Default heuristic: higher rank tiers earlier (black belts morning, color belts after noon).
 */

export type ScheduleSlotStatus = 'scheduled' | 'called' | 'running' | 'done';

export interface ScheduleSlot {
  id: string;
  tournamentId: string;
  divisionId: string;
  ringId: string;
  startTime: Date;
  /** Estimated duration in minutes. */
  estimatedDurationMin?: number;
  sequenceOrder: number;
  status: ScheduleSlotStatus;
}

export class ScheduleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleError';
  }
}

/** Create a ScheduleSlot. */
export function createScheduleSlot(params: {
  id: string;
  tournamentId: string;
  divisionId: string;
  ringId: string;
  startTime: Date;
  estimatedDurationMin?: number;
  sequenceOrder: number;
}): ScheduleSlot {
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    divisionId: params.divisionId,
    ringId: params.ringId,
    startTime: params.startTime,
    estimatedDurationMin: params.estimatedDurationMin,
    sequenceOrder: params.sequenceOrder,
    status: 'scheduled',
  };
}

/**
 * Placeholder for schedule generation (high rank tiers first).
 * M1 stub: returns empty array; full scheduler deferred.
 */
export function generateSchedule(
  _tournamentId: string,
  _divisions: { id: string; rankTier: string }[],
  _rings: { id: string }[],
  _startTime: Date,
): ScheduleSlot[] {
  // M1 stub: empty schedule (full scheduler with high-rank-first logic deferred).
  return [];
}
