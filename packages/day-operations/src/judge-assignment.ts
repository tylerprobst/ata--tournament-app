/**
 * JudgeAssignment — map Core Reg judge pool onto ring panels.
 * Assigns to RING (not device). Hard no-overlap vs active compete rings.
 */

import type { JudgePoolEntry } from './contracts.js';

export type JudgeRole = 'center' | 'corner';

export type JudgeAssignmentStatus =
  | 'proposed'
  | 'assigned'
  | 'active'
  | 'released';

export interface JudgeAssignmentWindow {
  startMs: number;
  endMs?: number;
}

export interface JudgeAssignment {
  id: string;
  personId: string;
  tournamentId: string;
  ringId: string;
  divisionId?: string;
  role: JudgeRole;
  panelSeat?: number;
  status: JudgeAssignmentStatus;
  window: JudgeAssignmentWindow;
}

export interface CreateJudgeAssignmentInput {
  id: string;
  personId: string;
  tournamentId: string;
  ringId: string;
  divisionId?: string;
  role: JudgeRole;
  panelSeat?: number;
  status?: JudgeAssignmentStatus;
  window: JudgeAssignmentWindow;
}

export function assignFromJudgePool(
  poolEntry: JudgePoolEntry,
  opts: {
    id: string;
    ringId: string;
    divisionId?: string;
    role?: JudgeRole;
    panelSeat?: number;
    window: JudgeAssignmentWindow;
  },
): JudgeAssignment {
  if (!poolEntry.willing) {
    throw new JudgeAssignmentError(
      `Person ${poolEntry.personId} is not willing to judge`,
    );
  }
  return createJudgeAssignment({
    id: opts.id,
    personId: poolEntry.personId,
    tournamentId: poolEntry.tournamentId,
    ringId: opts.ringId,
    divisionId: opts.divisionId,
    role: opts.role ?? poolEntry.preferredRole,
    panelSeat: opts.panelSeat,
    status: 'assigned',
    window: opts.window,
  });
}

export function createJudgeAssignment(
  input: CreateJudgeAssignmentInput,
): JudgeAssignment {
  const assignment: JudgeAssignment = {
    id: input.id,
    personId: input.personId,
    tournamentId: input.tournamentId,
    ringId: input.ringId,
    role: input.role,
    status: input.status ?? 'proposed',
    window: { ...input.window },
  };
  if (input.divisionId !== undefined) {
    assignment.divisionId = input.divisionId;
  }
  if (input.panelSeat !== undefined) {
    assignment.panelSeat = input.panelSeat;
  }
  return assignment;
}

export function noOverlap(
  personId: string,
  competeRingIds: readonly string[],
  judgeRingId: string,
): boolean {
  void personId;
  return !competeRingIds.includes(judgeRingId);
}

export class JudgeAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JudgeAssignmentError';
  }
}
