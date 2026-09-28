import { describe, it, expect } from 'vitest';
import {
  RankTier,
  degreeToRankTier,
  isBlockedAtRegional,
  EventType,
  EVENT_TYPE_ORDER,
  createTournament,
  TournamentError,
  createCompetitor,
  CompetitorError,
  ageAt,
  createDivision,
  createDraftRegistration,
  commitRegistration,
  scratchRegistration,
  RegistrationError,
} from '../src/index.js';

describe('RankTier and regional cap', () => {
  it('maps degree to RankTier', () => {
    expect(degreeToRankTier(0)).toBe(RankTier.ColorBelt);
    expect(degreeToRankTier(1)).toBe(RankTier.FirstDegree);
    expect(degreeToRankTier(2)).toBe(RankTier.SecondThirdDegree);
    expect(degreeToRankTier(3)).toBe(RankTier.SecondThirdDegree);
    expect(degreeToRankTier(4)).toBe(RankTier.FourthFifthDegree);
    expect(degreeToRankTier(5)).toBe(RankTier.FourthFifthDegree);
  });

  it('blocks 6th+ degree at regional level', () => {
    expect(isBlockedAtRegional(0)).toBe(false);
    expect(isBlockedAtRegional(5)).toBe(false);
    expect(isBlockedAtRegional(6)).toBe(true);
    expect(isBlockedAtRegional(7)).toBe(true);
    expect(() => degreeToRankTier(6)).toThrow(/exceeds regional cap/);
  });
});

describe('EventType locked order', () => {
  it('matches spec order: traditional forms → extreme weapons', () => {
    expect(EVENT_TYPE_ORDER).toEqual([
      EventType.TraditionalForms,
      EventType.TraditionalWeapons,
      EventType.CombatSparring,
      EventType.TraditionalSparring,
      EventType.CreativeForms,
      EventType.CreativeWeapons,
      EventType.ExtremeForms,
      EventType.ExtremeWeapons,
    ]);
  });
});

describe('Tournament', () => {
  it('creates a planned Tournament', () => {
    const t = createTournament({
      id: 't1',
      displayName: 'Spring Regional',
      venue: 'Main Gym',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-15'),
    });
    expect(t.status).toBe('planned');
    expect(t.displayName).toBe('Spring Regional');
  });

  it('rejects endDate before startDate', () => {
    expect(() =>
      createTournament({
        id: 't2',
        displayName: 'Bad Dates',
        venue: 'Gym',
        startDate: new Date('2026-03-20'),
        endDate: new Date('2026-03-19'),
      }),
    ).toThrow(TournamentError);
  });
});

describe('Competitor', () => {
  it('creates a Competitor with degree <= 5', () => {
    const c = createCompetitor({
      id: 'c1',
      displayName: 'Alice Brown',
      dateOfBirth: new Date('2010-06-15'),
      gender: 'female',
      currentDegree: 2,
      school: 'ATA Main',
    });
    expect(c.currentDegree).toBe(2);
    expect(degreeToRankTier(c.currentDegree)).toBe(RankTier.SecondThirdDegree);
  });

  it('blocks 6th+ degree at creation (regional cap)', () => {
    expect(() =>
      createCompetitor({
        id: 'c2',
        displayName: 'Master High',
        dateOfBirth: new Date('1970-01-01'),
        gender: 'male',
        currentDegree: 6,
      }),
    ).toThrow(CompetitorError);
    expect(() =>
      createCompetitor({
        id: 'c3',
        displayName: 'Master Higher',
        dateOfBirth: new Date('1970-01-01'),
        gender: 'male',
        currentDegree: 7,
      }),
    ).toThrow(/6th\+ blocked at regional/);
  });

  it('computes age at tournament date', () => {
    const c = createCompetitor({
      id: 'c4',
      displayName: 'Youth',
      dateOfBirth: new Date('2015-08-20'),
      gender: 'male',
      currentDegree: 0,
    });
    expect(ageAt(c, new Date('2026-09-01'))).toBe(11);
    expect(ageAt(c, new Date('2026-08-19'))).toBe(10);
  });
});

describe('Division', () => {
  it('creates a Division with EventType and rank tier', () => {
    const d = createDivision({
      id: 'd1',
      tournamentId: 't1',
      eventType: EventType.TraditionalSparring,
      ageBand: { id: 'youth', label: '10-12 years' },
      gender: 'male',
      rankTier: RankTier.ColorBelt,
      displayLabel: 'Youth Male Color Belt Trad Sparring',
    });
    expect(d.eventType).toBe(EventType.TraditionalSparring);
    expect(d.rankTier).toBe(RankTier.ColorBelt);
    expect(d.status).toBe('draft');
  });
});

describe('atomic Registration + payment', () => {
  it('creates draft then commits atomically with payment', () => {
    const reg = createDraftRegistration({
      id: 'r1',
      tournamentId: 't1',
      competitorId: 'c1',
      channel: 'online',
      divisionEntries: [
        { divisionId: 'd1', eventType: 'traditional_sparring' },
        { divisionId: 'd2', eventType: 'traditional_forms' },
      ],
      judgePreferences: { willingToJudge: true, preferredRole: 'center' },
    });
    expect(reg.status).toBe('draft');
    expect(reg.committedAtMs).toBeUndefined();

    const committed = commitRegistration(reg, true);
    expect(committed.status).toBe('registered');
    expect(committed.committedAtMs).toBeDefined();
    expect(committed.divisionEntries).toHaveLength(2);
  });

  it('rejects commit without payment confirmation (atomic invariant)', () => {
    const reg = createDraftRegistration({
      id: 'r2',
      tournamentId: 't1',
      competitorId: 'c1',
      channel: 'at_door',
      divisionEntries: [{ divisionId: 'd1', eventType: 'combat_sparring' }],
    });
    expect(() => commitRegistration(reg, false)).toThrow(RegistrationError);
    expect(() => commitRegistration(reg, false)).toThrow(/atomic/);
  });

  it('requires at least one division entry', () => {
    expect(() =>
      createDraftRegistration({
        id: 'r3',
        tournamentId: 't1',
        competitorId: 'c1',
        channel: 'online',
        divisionEntries: [],
      }),
    ).toThrow(RegistrationError);
  });

  it('allows scratching a registered competitor', () => {
    const reg = createDraftRegistration({
      id: 'r4',
      tournamentId: 't1',
      competitorId: 'c1',
      channel: 'online',
      divisionEntries: [{ divisionId: 'd1', eventType: 'creative_forms' }],
    });
    const committed = commitRegistration(reg, true);
    const scratched = scratchRegistration(committed);
    expect(scratched.status).toBe('scratched');
  });

  it('cannot scratch non-registered', () => {
    const reg = createDraftRegistration({
      id: 'r5',
      tournamentId: 't1',
      competitorId: 'c1',
      channel: 'online',
      divisionEntries: [{ divisionId: 'd1', eventType: 'extreme_weapons' }],
    });
    expect(() => scratchRegistration(reg)).toThrow(RegistrationError);
  });
});
