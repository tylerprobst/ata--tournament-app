/**
 * Registration — atomic registration + payment for a Competitor at a Tournament.
 * No paid-without-reg or reg-without-pay limbo states.
 * One Registration covers multiple Division entries for the same Competitor.
 */

export type RegistrationChannel = 'online' | 'at_door';
export type RegistrationStatus = 'draft' | 'registered' | 'scratched';

export interface DivisionEntry {
  divisionId: string;
  eventType: string;
}

export interface JudgePreferences {
  willingToJudge: boolean;
  preferredRole?: 'center' | 'corner';
}

export interface Registration {
  id: string;
  tournamentId: string;
  competitorId: string;
  channel: RegistrationChannel;
  /** Draft only for pre-commit; commit atomically sets status=registered. */
  status: RegistrationStatus;
  divisionEntries: DivisionEntry[];
  judgePreferences: JudgePreferences;
  /** Timestamp of atomic commit (registration + payment together). */
  committedAtMs?: number;
}

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

/** Create a draft Registration (not committed until payment processed). */
export function createDraftRegistration(params: {
  id: string;
  tournamentId: string;
  competitorId: string;
  channel: RegistrationChannel;
  divisionEntries: DivisionEntry[];
  judgePreferences?: JudgePreferences;
}): Registration {
  if (params.divisionEntries.length === 0) {
    throw new RegistrationError('Registration must include at least one division entry');
  }
  return {
    id: params.id,
    tournamentId: params.tournamentId,
    competitorId: params.competitorId,
    channel: params.channel,
    status: 'draft',
    divisionEntries: params.divisionEntries,
    judgePreferences: params.judgePreferences ?? { willingToJudge: false },
  };
}

/**
 * Commit atomic registration + payment (single transaction, no limbo).
 * Draft → Registered with timestamp.
 */
export function commitRegistration(
  registration: Registration,
  paymentConfirmed: boolean,
): Registration {
  if (registration.status !== 'draft') {
    throw new RegistrationError(
      `Cannot commit registration in status ${registration.status}; must be draft`,
    );
  }
  if (!paymentConfirmed) {
    throw new RegistrationError(
      'Registration and payment are atomic; paymentConfirmed must be true',
    );
  }
  return {
    ...registration,
    status: 'registered',
    committedAtMs: Date.now(),
  };
}

/** Scratch a registered competitor (withdraw from tournament). */
export function scratchRegistration(registration: Registration): Registration {
  if (registration.status !== 'registered') {
    throw new RegistrationError(
      `Cannot scratch registration in status ${registration.status}; must be registered`,
    );
  }
  return {
    ...registration,
    status: 'scratched',
  };
}
