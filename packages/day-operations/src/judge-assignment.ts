/**
 * JudgeAssignment — map judge pool onto rings and roles.
 * Hard rule: no-overlap (may not judge a ring where still an active competitor).
 */

export type JudgeRole = 'center' | 'corner';
export type JudgeAssignmentStatus = 'assigned' | 'declined' | 'removed';

export interface JudgeAssignment {
  id: string;
  tournamentId: string;
  personId: string;
  personName: string;
  /** Ring and/or Division target. */
  ringId?: string;
  divisionId?: string;
  role: JudgeRole;
  /** Panel position for forms/weapons (0, 1, 2 for three judges). */
  panelPosition?: number;
  status: JudgeAssignmentStatus;
}

export class JudgeAssignmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JudgeAssignmentError';
  }
}

/** Create a JudgeAssignment. */
export function createJudgeAssignment(params: {
  id: string;
  tournamentId: string;
  personId: string;
  personName: string;
  ringId?: string;
  divisionId?: string;
  role: JudgeRole;
  panelPosition?: number;
}): JudgeAssignment {
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    personId: params.personId,
    personName: params.personName,
    ringId: params.ringId,
    divisionId: params.divisionId,
    role: params.role,
    panelPosition: params.panelPosition,
    status: 'assigned',
  };
}

/**
 * Validate no-overlap constraint: person is not an active competitor in this ring.
 * Placeholder for M1; full check requires competitor-in-division lookup.
 */
export function validateNoOverlap(
  _assignment: JudgeAssignment,
  _competitorIdsInRing: string[],
): boolean {
  // M1 stub: always true (caller responsible for no-overlap check).
  return true;
}
