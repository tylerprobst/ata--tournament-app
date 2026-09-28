/**
 * Division — competition bucket (one EventType + eligibility facets).
 * One Division = one Ring for the day.
 */

import type { EventType } from './event-type.js';
import type { RankTier } from './rank-tier.js';

export type DivisionStatus = 'draft' | 'open' | 'closed' | 'in_progress' | 'complete';

/** Age band stub (organizer-defined). Exact cut ages deferred; id+label for M1. */
export interface AgeBand {
  id: string;
  label: string;
  minAge?: number;
  maxAge?: number;
}

export interface Division {
  id: string;
  tournamentId: string;
  eventType: EventType;
  ageBand: AgeBand;
  gender: 'male' | 'female' | 'open';
  rankTier: RankTier;
  displayLabel: string;
  status: DivisionStatus;
  /** Ring assigned to host this Division (one Ring = one Division for the day). */
  assignedRingId?: string;
}

export class DivisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DivisionError';
  }
}

/** Create a new Division. */
export function createDivision(params: {
  id: string;
  tournamentId: string;
  eventType: EventType;
  ageBand: AgeBand;
  gender: 'male' | 'female' | 'open';
  rankTier: RankTier;
  displayLabel: string;
}): Division {
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    eventType: params.eventType,
    ageBand: params.ageBand,
    gender: params.gender,
    rankTier: params.rankTier,
    displayLabel: params.displayLabel,
    status: 'draft',
  };
}
