import { describe, it, expect } from 'vitest';
import { ScoreEntry, ScoreEntryError } from '../src/scoring/score-entry.js';
import {
  EventType,
  TRADITIONAL_SPARRING_CAP,
  COMBAT_SPARRING_CAP,
  sumFormsDigits,
  capReached,
} from '../src/scoring/rules.js';

describe('ScoreEntry mutate + undo', () => {
  it('mutates sparring P/W in place and undoes to match start', () => {
    const entry = new ScoreEntry(EventType.TraditionalSparring, 'm-1');
    entry.markMatchStart();

    entry.addSparringTick('point', 'red');
    entry.addSparringTick('warning', 'white');
    entry.addSparringTick('point', 'red');

    expect(entry.pointsFor('red')).toBe(2);
    expect(entry.warningsFor('white')).toBe(1);
    expect(entry.ticks).toHaveLength(3);

    entry.undoToMatchStart();
    expect(entry.ticks).toHaveLength(0);
    expect(entry.pointsFor('red')).toBe(0);
    expect(entry.warningsFor('white')).toBe(0);
  });

  it('mutates forms digits in place and undoes', () => {
    const entry = new ScoreEntry(EventType.CreativeForms, 'perf-1');
    entry.markMatchStart();

    entry.setFormsDigit(0, 7);
    entry.setFormsDigit(1, 8);
    entry.setFormsDigit(2, 6);
    expect(entry.formsTotal()).toBe(21);
    expect(sumFormsDigits([7, 8, 6])).toBe(21);

    entry.undoToMatchStart();
    expect(entry.formsTotal()).toBeNull();
    expect(entry.formsDigits).toEqual([null, null, null]);
  });
});

describe('cap stop', () => {
  it('traditional sparring stops at cap 5', () => {
    const entry = new ScoreEntry(EventType.TraditionalSparring, 'm-trad');
    for (let i = 0; i < TRADITIONAL_SPARRING_CAP; i++) {
      entry.addSparringTick('point', 'red');
    }
    expect(entry.isCapReached()).toBe(true);
    expect(entry.capWinner()).toBe('red');
    expect(capReached(EventType.TraditionalSparring, 5)).toBe(true);

    expect(() => entry.addSparringTick('point', 'white')).toThrow(ScoreEntryError);
    expect(() => entry.addSparringTick('point', 'white')).toThrow(/Cap already reached/);
  });

  it('combat sparring stops at cap 10', () => {
    const entry = new ScoreEntry(EventType.CombatSparring, 'm-combat');
    for (let i = 0; i < COMBAT_SPARRING_CAP; i++) {
      entry.addSparringTick('point', 'white');
    }
    expect(entry.isCapReached()).toBe(true);
    expect(entry.capWinner()).toBe('white');
    expect(() => entry.addSparringTick('warning', 'red')).toThrow(/Cap already reached/);
  });
});
