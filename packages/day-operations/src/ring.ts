/**
 * Ring — physical competition space.
 * One Division per assignment window; assignment to RING not device.
 */

export type RingStatus = 'idle' | 'active' | 'held';

export interface Ring {
  id: string;
  tournamentId: string;
  label: string;
  locationNotes?: string;
  status: RingStatus;
  divisionId?: string;
}

export interface CreateRingInput {
  id: string;
  tournamentId: string;
  label: string;
  locationNotes?: string;
  divisionId?: string;
}

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

export function assignDivision(ring: Ring, divisionId: string | undefined): Ring {
  return { ...ring, divisionId };
}

export function setRingStatus(ring: Ring, status: RingStatus): Ring {
  return { ...ring, status };
}
