/**
 * RingRole — staff roles attached to a Ring (timekeeper, scorekeeper).
 * Distinct from JudgeAssignment (judges score; RingRole runs table operations).
 */

export type RingRoleType = 'timekeeper' | 'scorekeeper';

export interface RingRole {
  id: string;
  ringId: string;
  roleType: RingRoleType;
  /** Staff or competitor acting as staff. */
  assignedPersonId: string;
  assignedPersonName: string;
}

export class RingRoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RingRoleError';
  }
}

/** Create a RingRole assignment. */
export function createRingRole(params: {
  id: string;
  ringId: string;
  roleType: RingRoleType;
  assignedPersonId: string;
  assignedPersonName: string;
}): RingRole {
  return {
    id: params.id,
    ringId: params.ringId,
    roleType: params.roleType,
    assignedPersonId: params.assignedPersonId,
    assignedPersonName: params.assignedPersonName,
  };
}
