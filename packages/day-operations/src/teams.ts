/**
 * Teams stub — unit registration path only.
 * No deep member→Division sync (later product).
 */

export type TeamStatus =
  | 'draft'
  | 'registered'
  | 'checked_in'
  | 'scratched';

export interface Team {
  id: string;
  name: string;
  schoolOrg: string;
  tournamentId: string;
  status: TeamStatus;
  memberIds: string[];
}

export interface RegisterTeamUnitInput {
  id: string;
  name: string;
  schoolOrg: string;
  tournamentId: string;
  memberIds?: string[];
}

export class TeamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamsError';
  }
}

export function registerTeamUnit(input: RegisterTeamUnitInput): Team {
  const name = input.name?.trim() ?? '';
  if (!name) {
    throw new TeamsError('Team name is required');
  }
  if (!input.tournamentId) {
    throw new TeamsError('tournamentId is required');
  }
  return {
    id: input.id,
    name,
    schoolOrg: input.schoolOrg?.trim() ?? '',
    tournamentId: input.tournamentId,
    status: 'registered',
    memberIds: [...(input.memberIds ?? [])],
  };
}
