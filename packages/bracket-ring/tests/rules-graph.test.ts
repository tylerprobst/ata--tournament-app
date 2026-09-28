import { describe, it, expect } from 'vitest';
import {
  EventType,
  EVENT_TYPE_ORDER,
  sumFormsDigits,
  capReached,
} from '../src/scoring/rules.js';
import {
  buildSingleElimGraph,
  completeMatch,
  feedThirdPlaceFromSemis,
  nextPowerOfTwo,
} from '../src/bracket/graph.js';

describe('EventType locked order', () => {
  it('matches architecture catalog order', () => {
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

describe('forms sum + sparring caps', () => {
  it('sums three digits 1–9', () => {
    expect(sumFormsDigits([1, 1, 1])).toBe(3);
    expect(sumFormsDigits([9, 9, 9])).toBe(27);
  });

  it('rejects out-of-range digits', () => {
    expect(() => sumFormsDigits([0, 5, 5])).toThrow();
    expect(() => sumFormsDigits([5, 10, 5])).toThrow();
  });

  it('capReached respects trad=5 combat=10', () => {
    expect(capReached(EventType.TraditionalSparring, 4)).toBe(false);
    expect(capReached(EventType.TraditionalSparring, 5)).toBe(true);
    expect(capReached(EventType.CombatSparring, 9)).toBe(false);
    expect(capReached(EventType.CombatSparring, 10)).toBe(true);
    expect(capReached(EventType.TraditionalForms, 99)).toBe(false);
  });
});

describe('single-elim graph', () => {
  it('builds dynamic N (not fixed 16) with 3rd-place', () => {
    expect(nextPowerOfTwo(5)).toBe(8);
    const graph = buildSingleElimGraph(['a', 'b', 'c', 'd', 'e']);
    expect(graph.bracketSize).toBe(8);
    expect(graph.byeCount).toBe(3);
    expect(graph.thirdPlaceMatchId).not.toBeNull();
    expect(graph.finalMatchId).not.toBeNull();
  });

  it('advances winners and feeds 3rd-place from semi losers', () => {
    // Exact power of 2: 4 competitors → semis + final + 3rd
    const graph = buildSingleElimGraph(['a', 'b', 'c', 'd']);
    expect(graph.bracketSize).toBe(4);

    const semis = graph.matches.filter((m) => m.round === 0 && !m.isThirdPlace);
    expect(semis).toHaveLength(2);

    completeMatch(graph, semis[0]!.id, 'red'); // a beats b
    completeMatch(graph, semis[1]!.id, 'white'); // d beats c

    expect(feedThirdPlaceFromSemis(graph)).toBe(true);
    const third = graph.matches.find((m) => m.isThirdPlace)!;
    const loserIds = [third.red?.competitorId, third.white?.competitorId].sort();
    expect(loserIds).toEqual(['b', 'c']);
  });
});
