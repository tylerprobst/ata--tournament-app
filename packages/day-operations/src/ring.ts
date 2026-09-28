/**
 * Ring — physical competition space.
 * One Ring hosts exactly one Division for a given assignment window.
 */

export type RingStatus = 'idle' | 'active' | 'held';

export interface Ring {
  id: string;
  tournamentId: string;
  label: string;
  location?: string;
  status: RingStatus;
  /** Currently assigned Division (one Ring = one Division for the day). */
  currentDivisionId?: string;
}

export class RingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RingError';
  }
}

/** Create a new Ring. */
export function createRing(params: {
  id: string;
  tournamentId: string;
  label: string;
  location?: string;
}): Ring {
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    label: params.label,
    location: params.location,
    status: 'idle',
  };
}

/** Assign a Division to a Ring (mutates the division assignment). */
export function assignDivision(ring: Ring, divisionId: string): Ring {
  if (ring.status === 'active') {
    throw new RingError(`Cannot reassign Ring ${ring.id} while active`);
  }
  return {
    ...ring,
    currentDivisionId: divisionId,
  };
}

/** Start a Ring (transition to active, locks bracket if sparring). */
export function startRing(ring: Ring): Ring {
  if (ring.status === 'active') {
    throw new RingError(`Ring ${ring.id} is already active`);
  }
  if (!ring.currentDivisionId) {
    throw new RingError(`Cannot start Ring ${ring.id} without assigned Division`);
  }
  return {
    ...ring,
    status: 'active',
  };
}
