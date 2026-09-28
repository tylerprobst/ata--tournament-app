/**
 * BracketWizard state machine.
 *
 * AskTitles → NoTitles (random byes) | HasTitles (ephemeral title holders get
 * byes, leftover byes random) → Generated → LiveReorder → Locked.
 *
 * Titles are NOT persisted. lock() only from ring-start. reorder while mutable.
 */

import {
  buildSingleElimGraph,
  type BracketGraph,
  nextPowerOfTwo,
} from './graph.js';
import type { DivisionCompetitorPool } from '../contracts.js';

export type WizardPhase =
  | 'ask_titles'
  | 'no_titles'
  | 'has_titles'
  | 'generated'
  | 'live_reorder'
  | 'locked';

export class WizardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WizardError';
  }
}

export interface WizardSnapshot {
  phase: WizardPhase;
  competitorIds: string[];
  /** Ephemeral for this wizard session only — never persisted. */
  ephemeralTitleHolderIds: string[];
  graph: BracketGraph | null;
  locked: boolean;
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

/**
 * Ring-side bracket creation wizard.
 * Titles selected here exist only in memory for this session.
 */
export class BracketWizard {
  private phase: WizardPhase = 'ask_titles';
  private readonly competitorIds: string[];
  /** Ephemeral — never written to durable storage. */
  private ephemeralTitleHolderIds: string[] = [];
  private graph: BracketGraph | null = null;
  private locked = false;
  private readonly rng: () => number;

  constructor(pool: DivisionCompetitorPool, rng: () => number = Math.random) {
    if (pool.competitors.length < 1) {
      throw new WizardError('DivisionCompetitorPool must have at least one competitor');
    }
    this.competitorIds = pool.competitors.map((c) => c.id);
    this.rng = rng;
  }

  getPhase(): WizardPhase {
    return this.phase;
  }

  isLocked(): boolean {
    return this.locked;
  }

  getGraph(): BracketGraph | null {
    return this.graph;
  }

  /** Title holders for this session only — not a durable store. */
  getEphemeralTitleHolders(): readonly string[] {
    return this.ephemeralTitleHolderIds;
  }

  snapshot(): WizardSnapshot {
    return {
      phase: this.phase,
      competitorIds: [...this.competitorIds],
      ephemeralTitleHolderIds: [...this.ephemeralTitleHolderIds],
      graph: this.graph,
      locked: this.locked,
    };
  }

  /**
   * Answer the championship-titles question (first wizard step).
   * If hasTitles is false → NoTitles path (random byes on generate).
   * If true → HasTitles path; call setTitleHolders then generate.
   */
  answerTitlesQuestion(hasTitles: boolean): void {
    this.assertPhase('ask_titles');
    this.phase = hasTitles ? 'has_titles' : 'no_titles';
    if (!hasTitles) {
      this.ephemeralTitleHolderIds = [];
    }
  }

  /**
   * Select ephemeral title holders for this event only.
   * Only valid in HasTitles phase. Does not persist.
   */
  setTitleHolders(competitorIds: readonly string[]): void {
    this.assertPhase('has_titles');
    const set = new Set(this.competitorIds);
    for (const id of competitorIds) {
      if (!set.has(id)) {
        throw new WizardError(`Unknown competitor for title holder: ${id}`);
      }
    }
    this.ephemeralTitleHolderIds = [...new Set(competitorIds)];
  }

  /**
   * Generate the single-elim graph.
   * - NoTitles: shuffle field, random bye placement.
   * - HasTitles: title holders get bye slots first; leftover byes random.
   */
  generate(): BracketGraph {
    if (this.phase !== 'no_titles' && this.phase !== 'has_titles') {
      throw new WizardError(
        `generate() requires no_titles or has_titles, current=${this.phase}`,
      );
    }

    const field = [...this.competitorIds];
    const n = field.length;
    const bracketSize = nextPowerOfTwo(n);
    const byeCount = bracketSize - n;

    let orderedIds: string[];
    let byePlacement: number[];

    if (this.phase === 'no_titles') {
      shuffleInPlace(field, this.rng);
      orderedIds = field;
      const allSlots = Array.from({ length: bracketSize }, (_, i) => i);
      shuffleInPlace(allSlots, this.rng);
      byePlacement = allSlots.slice(0, byeCount).sort((a, b) => a - b);
    } else {
      const holders = new Set(this.ephemeralTitleHolderIds);
      const titleHolders = field.filter((id) => holders.has(id));
      const others = field.filter((id) => !holders.has(id));
      shuffleInPlace(others, this.rng);

      const byesForTitles = Math.min(titleHolders.length, byeCount);
      const leftoverByes = byeCount - byesForTitles;

      const placed = this.placeWithTitleByes(
        titleHolders,
        others,
        bracketSize,
        byeCount,
        byesForTitles,
        leftoverByes,
      );
      orderedIds = placed.ids;
      byePlacement = placed.byePlacement;
    }

    this.graph = buildSingleElimGraph(orderedIds, { byePlacement });
    this.phase = 'generated';
    return this.graph;
  }

  /**
   * Place competitors so title holders receive first-round byes when possible.
   */
  private placeWithTitleByes(
    titleHolders: string[],
    others: string[],
    bracketSize: number,
    byeCount: number,
    byesForTitles: number,
    leftoverByes: number,
  ): { ids: string[]; byePlacement: number[] } {
    const pairCount = bracketSize / 2;
    const pairOrder = Array.from({ length: pairCount }, (_, i) => i);
    shuffleInPlace(pairOrder, this.rng);

    const slotOccupant: (string | 'BYE' | null)[] = Array.from(
      { length: bracketSize },
      () => null,
    );

    let holderIdx = 0;
    let pairsUsedForTitles = 0;
    for (const pair of pairOrder) {
      if (pairsUsedForTitles >= byesForTitles) break;
      if (holderIdx >= titleHolders.length) break;
      const red = pair * 2;
      const white = pair * 2 + 1;
      if (this.rng() < 0.5) {
        slotOccupant[red] = 'BYE';
        slotOccupant[white] = titleHolders[holderIdx]!;
      } else {
        slotOccupant[white] = 'BYE';
        slotOccupant[red] = titleHolders[holderIdx]!;
      }
      holderIdx += 1;
      pairsUsedForTitles += 1;
    }

    const remainingHolders = titleHolders.slice(holderIdx);
    const remainingPeople = [...remainingHolders, ...others];
    shuffleInPlace(remainingPeople, this.rng);

    const emptySlots = slotOccupant
      .map((v, i) => (v === null ? i : -1))
      .filter((i) => i >= 0);
    shuffleInPlace(emptySlots, this.rng);
    for (let i = 0; i < leftoverByes && i < emptySlots.length; i++) {
      slotOccupant[emptySlots[i]!] = 'BYE';
    }

    let p = 0;
    for (let i = 0; i < bracketSize; i++) {
      if (slotOccupant[i] === null) {
        const id = remainingPeople[p];
        if (id === undefined) throw new WizardError('Placement underflow');
        slotOccupant[i] = id;
        p += 1;
      }
    }

    const byePlacement: number[] = [];
    const ids: string[] = [];
    for (let i = 0; i < bracketSize; i++) {
      const v = slotOccupant[i];
      if (v === 'BYE') byePlacement.push(i);
      else if (typeof v === 'string') ids.push(v);
    }

    if (ids.length !== titleHolders.length + others.length) {
      throw new WizardError('Title-bye placement did not consume all competitors');
    }
    if (byePlacement.length !== byeCount) {
      throw new WizardError(
        `Expected ${byeCount} byes, placed ${byePlacement.length}`,
      );
    }

    return { ids, byePlacement };
  }

  /** Enter live reorder phase (after generate, before lock). */
  beginReorder(): void {
    this.assertMutable();
    if (this.phase !== 'generated' && this.phase !== 'live_reorder') {
      throw new WizardError(
        `beginReorder() requires generated or live_reorder, current=${this.phase}`,
      );
    }
    this.phase = 'live_reorder';
  }

  /**
   * Swap two first-round slot occupants while mutable.
   * Blocked after lock (ring start).
   */
  reorderSlots(slotIndexA: number, slotIndexB: number): void {
    this.assertMutable();
    if (this.phase !== 'generated' && this.phase !== 'live_reorder') {
      throw new WizardError(
        `reorderSlots() requires generated or live_reorder, current=${this.phase}`,
      );
    }
    if (!this.graph) throw new WizardError('No graph to reorder');

    const a = this.graph.slots[slotIndexA];
    const b = this.graph.slots[slotIndexB];
    if (!a || !b) {
      throw new WizardError(`Invalid slot indices ${slotIndexA}, ${slotIndexB}`);
    }

    const tmp = a.occupant;
    a.occupant = b.occupant;
    b.occupant = tmp;

    const firstRound = this.graph.matches.filter(
      (m) => m.round === 0 && !m.isThirdPlace,
    );
    for (const match of firstRound) {
      const redSlot = this.graph.slots[match.indexInRound * 2];
      const whiteSlot = this.graph.slots[match.indexInRound * 2 + 1];
      match.red = redSlot?.occupant ?? null;
      match.white = whiteSlot?.occupant ?? null;

      const redBye = match.red?.kind === 'bye';
      const whiteBye = match.white?.kind === 'bye';
      if (redBye || whiteBye) {
        match.status = 'walkover';
        if (match.red?.kind === 'competitor') match.winner = match.red;
        else if (match.white?.kind === 'competitor') match.winner = match.white;
        else match.winner = { kind: 'bye' };
      } else {
        match.status = 'pending';
        match.winner = null;
      }
    }

    this.phase = 'live_reorder';
  }

  /**
   * Lock the bracket. Only valid from ring-start (Day Ops RingStartLockSignal).
   * After lock, reorder is blocked.
   */
  lock(_signal?: { reason: 'ring_start' }): void {
    this.assertMutable();
    if (this.phase !== 'generated' && this.phase !== 'live_reorder') {
      throw new WizardError(
        `lock() requires generated or live_reorder (ring-start), current=${this.phase}`,
      );
    }
    if (!this.graph) throw new WizardError('Cannot lock without a generated bracket');

    this.locked = true;
    this.phase = 'locked';
  }

  private assertPhase(expected: WizardPhase): void {
    if (this.phase !== expected) {
      throw new WizardError(`Expected phase ${expected}, current=${this.phase}`);
    }
  }

  private assertMutable(): void {
    if (this.locked || this.phase === 'locked') {
      throw new WizardError('Bracket is locked (ring started); reorder/lock blocked');
    }
  }
}
