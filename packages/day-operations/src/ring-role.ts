/**
 * RingRole — timekeeper / scorekeeper staffed on a Ring.
 * Distinct from JudgeAssignment. Belongs to ring context, NOT device identity
 * (hot-spare tablet = ring context).
 */

export type RingRoleType = 'timekeeper' | 'scorekeeper';

export interface AssignmentWindow {
  /** Epoch ms start of staff assignment (local tournament clock). */
  startMs: number;
  /** Epoch ms end; omit for open-ended window. */
  endMs?: number;
}

export interface RingRole {
  id: string;
  ringId: string;
  role: RingRoleType;
  assignedPersonId: string;
  window: AssignmentWindow;
}

export class RingRoleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RingRoleError';
  }
}

export interface CreateRingRoleInput {
  id: string;
  ringId: string;
  role: RingRoleType;
  assignedPersonId: string;
  window: AssignmentWindow;
}

export function createRingRole(input: CreateRingRoleInput): RingRole {
  return {
    id: input.id,
    ringId: input.ringId,
    role: input.role,
    assignedPersonId: input.assignedPersonId,
    window: { ...input.window },
  };
}
