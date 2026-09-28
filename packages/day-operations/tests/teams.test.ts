import { describe, it, expect } from 'vitest';
import { registerTeamUnit, TeamsError } from '../src/teams.js';

describe('registerTeamUnit', () => {
  it('registers a team unit without Division sync', () => {
    const team = registerTeamUnit({
      id: 'team-1',
      name: 'ATA Demo School',
      schoolOrg: 'Demo Dojang',
      tournamentId: 't1',
      memberIds: ['c1', 'c2'],
    });
    expect(team.status).toBe('registered');
    expect(team.memberIds).toEqual(['c1', 'c2']);
    expect(team.name).toBe('ATA Demo School');
  });

  it('requires a team name', () => {
    expect(() =>
      registerTeamUnit({
        id: 'team-2',
        name: '  ',
        schoolOrg: 'X',
        tournamentId: 't1',
      }),
    ).toThrow(TeamsError);
  });
});
