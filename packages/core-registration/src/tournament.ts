/**
 * Tournament — top-level competition container.
 * Owns all divisions, rings, registrations for a single-day/multi-day event.
 */

export type TournamentStatus = 'planned' | 'in_progress' | 'complete';

export interface Tournament {
  id: string;
  displayName: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  status: TournamentStatus;
  notes?: string;
}

export class TournamentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TournamentError';
  }
}

/** Create a new Tournament. */
export function createTournament(params: {
  id: string;
  displayName: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}): Tournament {
  if (params.endDate < params.startDate) {
    throw new TournamentError('endDate cannot be before startDate');
  }
  return {
    id: params.id,
    displayName: params.displayName,
    venue: params.venue,
    startDate: params.startDate,
    endDate: params.endDate,
    status: 'planned',
    notes: params.notes,
  };
}
