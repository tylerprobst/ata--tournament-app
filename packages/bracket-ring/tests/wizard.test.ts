import { describe, it, expect } from 'vitest';
import { BracketWizard, WizardError } from '../src/bracket/wizard.js';
import type { DivisionCompetitorPool } from '../src/contracts.js';

function pool(ids: string[]): DivisionCompetitorPool {
  return {
    tournamentId: 't1',
    divisionId: 'd1',
    eventType: 'traditional_sparring',
    competitors: ids.map((id) => ({ id, displayName: id })),
  };
}

/** Deterministic RNG sequence. */
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i % values.length]!;
    i += 1;
    return v;
  };
}

describe('BracketWizard', () => {
  it('NoTitles path: random byes, reaches generated', () => {
    // 5 competitors → bracket 8 → 3 byes
    const wiz = new BracketWizard(pool(['a', 'b', 'c', 'd', 'e']), seqRng([0.1, 0.9, 0.2, 0.8, 0.3]));
    expect(wiz.getPhase()).toBe('ask_titles');

    wiz.answerTitlesQuestion(false);
    expect(wiz.getPhase()).toBe('no_titles');
    expect(wiz.getEphemeralTitleHolders()).toEqual([]);

    const graph = wiz.generate();
    expect(wiz.getPhase()).toBe('generated');
    expect(graph.fieldSize).toBe(5);
    expect(graph.bracketSize).toBe(8);
    expect(graph.byeCount).toBe(3);
    expect(graph.slots.filter((s) => s.occupant?.kind === 'bye')).toHaveLength(3);
  });

  it('HasTitles path: title holders receive first-round byes', () => {
    // 6 competitors → bracket 8 → 2 byes; 2 title holders should get them
    const wiz = new BracketWizard(
      pool(['a', 'b', 'c', 'd', 'e', 'f']),
      seqRng([0.4, 0.6, 0.1, 0.9, 0.2, 0.7, 0.3, 0.5]),
    );

    wiz.answerTitlesQuestion(true);
    expect(wiz.getPhase()).toBe('has_titles');

    wiz.setTitleHolders(['a', 'b']);
    expect(wiz.getEphemeralTitleHolders()).toEqual(['a', 'b']);

    const graph = wiz.generate();
    expect(wiz.getPhase()).toBe('generated');
    expect(graph.byeCount).toBe(2);

    // Each title holder should be in a first-round walkover (paired with bye)
    const firstRound = graph.matches.filter((m) => m.round === 0 && !m.isThirdPlace);
    const walkovers = firstRound.filter((m) => m.status === 'walkover');
    const walkoverWinners = walkovers
      .map((m) => m.winner?.competitorId)
      .filter(Boolean);

    expect(walkoverWinners).toContain('a');
    expect(walkoverWinners).toContain('b');
  });

  it('titles stay ephemeral (in-memory only, not a durable field on graph)', () => {
    const wiz = new BracketWizard(pool(['a', 'b', 'c', 'd']));
    wiz.answerTitlesQuestion(true);
    wiz.setTitleHolders(['a']);
    wiz.generate();
    // Graph has no titleHolder property — titles only on wizard session
    expect(wiz.getGraph()).not.toHaveProperty('titleHolders');
    expect(wiz.snapshot().ephemeralTitleHolderIds).toEqual(['a']);
  });

  it('lock from ring-start blocks further reorder', () => {
    const wiz = new BracketWizard(pool(['a', 'b', 'c', 'd']));
    wiz.answerTitlesQuestion(false);
    wiz.generate();
    wiz.beginReorder();
    expect(wiz.getPhase()).toBe('live_reorder');

    // Reorder while mutable works
    wiz.reorderSlots(0, 1);

    wiz.lock({ reason: 'ring_start' });
    expect(wiz.getPhase()).toBe('locked');
    expect(wiz.isLocked()).toBe(true);

    expect(() => wiz.reorderSlots(0, 2)).toThrow(WizardError);
    expect(() => wiz.reorderSlots(0, 2)).toThrow(/locked/);
  });

  it('cannot lock before generate', () => {
    const wiz = new BracketWizard(pool(['a', 'b']));
    expect(() => wiz.lock({ reason: 'ring_start' })).toThrow(WizardError);
  });
});
