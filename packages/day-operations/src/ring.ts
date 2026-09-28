/**
 * Ring — physical competition space.
 * One Ring hosts exactly one Division for a given assignment window.
 * Assignment to RING not device.
 */

export type RingStatus = 'idle' | 'active' | 'held';

export interface Ring {
  id: string;
  tournamentId: string;
  /** e.g. "Ring 3" */
  label: string;
  locationNotes?: string;
  status: RingStatus;
  /**
   * Division assigned for the current assignment window.
   * One Ring hosts exactly one Division at a time.
   */
  divisionId?: string;
}

export class RingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RingError';
  }
}

export interface CreateRingInput {
  id: string;
  tournamentId: string;
  label: string;
  locationNotes?: string;
  divisionId?: string;
}

/** Create a Ring in idle status. */
export function createRing(input: CreateRingInput): Ring {
  const ring: Ring = {
    id: input.id,
    tournamentId: input.tournamentId,
    label: input.label,
    status: 'idle',
  };
  if (input.locationNotes !== undefined) {
    ring.locationNotes = input.locationNotes;
  }
  if (input.divisionId !== undefined) {
    ring.divisionId = input.divisionId;
  }
  return ring;
}

/** Assign (or clear) the Division for this ring's current window. */
export function assignDivision(ring: Ring, divisionId: string | undefined): Ring {
  return { ...ring, divisionId };
}

export function setRingStatus(ring: Ring, status: RingStatus): Ring {
  return { ...ring, status };
}
