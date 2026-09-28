/**
 * Mutable ScoreEntry for sparring P/W and forms/weapons digits.
 * Updates mutate in place (no routine event log). undoToMatchStart resets.
 */

import {
  EventType,
  assertFormsDigit,
  capReached,
  sparringCap,
  sumFormsDigits,
  type FormsDigits,
  isFormsOrWeapons,
  isSparring,
} from './rules.js';

export type SparringKind = 'point' | 'warning';
export type Side = 'red' | 'white';

export interface SparringTick {
  kind: SparringKind;
  side: Side;
  ordinal: number;
}

export class ScoreEntryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScoreEntryError';
  }
}

/**
 * One scoring session for a Match (sparring) or forms/weapons performance.
 * Plain mutable state — mutate methods update in place.
 */
export class ScoreEntry {
  readonly eventType: EventType;
  readonly matchId: string;

  /** Sparring P/W ticks (ordinal ascending). */
  ticks: SparringTick[] = [];
  /** Forms/weapons: up to three judge digits. */
  formsDigits: (number | null)[] = [null, null, null];

  private matchStartSnapshot: {
    ticks: SparringTick[];
    formsDigits: (number | null)[];
  };

  constructor(eventType: EventType, matchId: string) {
    this.eventType = eventType;
    this.matchId = matchId;
    this.matchStartSnapshot = this.capture();
  }

  private capture() {
    return {
      ticks: this.ticks.map((t) => ({ ...t })),
      formsDigits: [...this.formsDigits] as (number | null)[],
    };
  }

  /** Mark current state as the undo baseline (e.g. at match start). */
  markMatchStart(): void {
    this.matchStartSnapshot = this.capture();
  }

  /** Restore ticks/digits to match-start snapshot (in place). */
  undoToMatchStart(): void {
    this.ticks = this.matchStartSnapshot.ticks.map((t) => ({ ...t }));
    this.formsDigits = [...this.matchStartSnapshot.formsDigits];
  }

  pointsFor(side: Side): number {
    return this.ticks.filter((t) => t.kind === 'point' && t.side === side).length;
  }

  warningsFor(side: Side): number {
    return this.ticks.filter((t) => t.kind === 'warning' && t.side === side).length;
  }

  /** True if either side has reached the EventType cap. */
  isCapReached(): boolean {
    if (!isSparring(this.eventType)) return false;
    return (
      capReached(this.eventType, this.pointsFor('red')) ||
      capReached(this.eventType, this.pointsFor('white'))
    );
  }

  /** Side that hit cap, if any. */
  capWinner(): Side | null {
    if (!isSparring(this.eventType)) return null;
    if (capReached(this.eventType, this.pointsFor('red'))) return 'red';
    if (capReached(this.eventType, this.pointsFor('white'))) return 'white';
    return null;
  }

  /**
   * Add a sparring point or warning. Mutates in place.
   * Throws if forms EventType, or if cap already reached (auto-stop).
   */
  addSparringTick(kind: SparringKind, side: Side): SparringTick {
    if (!isSparring(this.eventType)) {
      throw new ScoreEntryError(
        `addSparringTick not valid for EventType ${this.eventType}`,
      );
    }
    if (this.isCapReached()) {
      throw new ScoreEntryError(
        `Cap already reached (cap=${sparringCap(this.eventType)}); scoring stopped`,
      );
    }

    const tick: SparringTick = {
      kind,
      side,
      ordinal: this.ticks.length + 1,
    };
    this.ticks.push(tick);
    return tick;
  }

  /**
   * Set one forms/weapons judge digit (0..2). Mutates in place.
   */
  setFormsDigit(judgeIndex: number, digit: number): void {
    if (!isFormsOrWeapons(this.eventType)) {
      throw new ScoreEntryError(
        `setFormsDigit not valid for EventType ${this.eventType}`,
      );
    }
    if (judgeIndex < 0 || judgeIndex > 2) {
      throw new ScoreEntryError(`judgeIndex must be 0..2, got ${judgeIndex}`);
    }
    assertFormsDigit(digit);
    this.formsDigits[judgeIndex] = digit;
  }

  /** Sum when all three digits present; otherwise null. */
  formsTotal(): number | null {
    if (!isFormsOrWeapons(this.eventType)) return null;
    const [a, b, c] = this.formsDigits;
    if (a === null || b === null || c === null) return null;
    return sumFormsDigits([a, b, c] as FormsDigits);
  }
}
