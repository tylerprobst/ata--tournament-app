/**
 * Single-elimination bracket graph for field size N (dynamic, not fixed 16).
 * Red/White corners, byes/walkovers, 3rd-place consolation from semi losers.
 */

export type Corner = 'red' | 'white';
export type MatchStatus = 'pending' | 'in_progress' | 'complete' | 'walkover';

export interface SlotOccupant {
  kind: 'competitor' | 'bye';
  competitorId?: string;
}

export interface BracketSlot {
  index: number;
  occupant: SlotOccupant | null;
}

export interface Match {
  id: string;
  /** Round depth: 0 = first round, higher toward final. */
  round: number;
  /** Index within the round (0-based). */
  indexInRound: number;
  red: SlotOccupant | null;
  white: SlotOccupant | null;
  status: MatchStatus;
  winner: SlotOccupant | null;
  /** True for the consolation match fed by semi-final losers. */
  isThirdPlace: boolean;
  /** Next match id for winner advancement (undefined for final / 3rd place). */
  nextMatchId?: string;
  /** Which corner the winner fills in nextMatch. */
  nextCorner?: Corner;
}

export interface BracketGraph {
  fieldSize: number;
  bracketSize: number;
  byeCount: number;
  slots: BracketSlot[];
  matches: Match[];
  finalMatchId: string | null;
  thirdPlaceMatchId: string | null;
}

/** Next power of 2 >= n (minimum 2 for a bout). */
export function nextPowerOfTwo(n: number): number {
  if (n < 2) return 2;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function emptyBye(): SlotOccupant {
  return { kind: 'bye' };
}

function competitor(id: string): SlotOccupant {
  return { kind: 'competitor', competitorId: id };
}

/**
 * Build single-elim slots + matches for N competitors.
 * First-round byes fill empty power-of-two slots so some competitors advance
 * automatically (walkover). Includes a 3rd-place match when bracketSize >= 4.
 */
export function buildSingleElimGraph(
  competitorIds: readonly string[],
  options?: { byePlacement?: 'end' | 'start' | number[] },
): BracketGraph {
  const fieldSize = competitorIds.length;
  if (fieldSize < 1) {
    throw new Error('Field size must be at least 1');
  }

  const bracketSize = nextPowerOfTwo(fieldSize);
  const byeCount = bracketSize - fieldSize;

  const occupants: SlotOccupant[] = [];
  const byeIndices = new Set<number>();

  if (options?.byePlacement && Array.isArray(options.byePlacement)) {
    for (const i of options.byePlacement) byeIndices.add(i);
  } else if (options?.byePlacement === 'start') {
    for (let i = 0; i < byeCount; i++) byeIndices.add(i);
  } else {
    // Default: byes at end of first-round slot list
    for (let i = bracketSize - byeCount; i < bracketSize; i++) byeIndices.add(i);
  }

  let compIdx = 0;
  for (let i = 0; i < bracketSize; i++) {
    if (byeIndices.has(i)) {
      occupants.push(emptyBye());
    } else {
      const id = competitorIds[compIdx];
      if (id === undefined) throw new Error('Competitor list shorter than expected');
      occupants.push(competitor(id));
      compIdx += 1;
    }
  }

  const slots: BracketSlot[] = occupants.map((occupant, index) => ({
    index,
    occupant,
  }));

  const matches: Match[] = [];
  let matchSeq = 0;
  const idFor = () => {
    matchSeq += 1;
    return `m-${matchSeq}`;
  };

  // First round: pair slots 0-1, 2-3, …
  const firstRoundCount = bracketSize / 2;
  const roundMatchIds: string[][] = [[]];

  for (let i = 0; i < firstRoundCount; i++) {
    const red = occupants[i * 2] ?? null;
    const white = occupants[i * 2 + 1] ?? null;
    const id = idFor();
    const isWalkover =
      (red?.kind === 'bye' && white?.kind === 'competitor') ||
      (white?.kind === 'bye' && red?.kind === 'competitor') ||
      (red?.kind === 'bye' && white?.kind === 'bye');

    let status: MatchStatus = 'pending';
    let winner: SlotOccupant | null = null;
    if (isWalkover) {
      status = 'walkover';
      if (red?.kind === 'competitor') winner = red;
      else if (white?.kind === 'competitor') winner = white;
      else winner = emptyBye();
    }

    matches.push({
      id,
      round: 0,
      indexInRound: i,
      red,
      white,
      status,
      winner,
      isThirdPlace: false,
    });
    roundMatchIds[0]!.push(id);
  }

  // Subsequent rounds until final
  let prevRoundSize = firstRoundCount;
  let round = 1;
  while (prevRoundSize > 1) {
    const thisRoundSize = prevRoundSize / 2;
    const ids: string[] = [];
    for (let i = 0; i < thisRoundSize; i++) {
      const id = idFor();
      matches.push({
        id,
        round,
        indexInRound: i,
        red: null,
        white: null,
        status: 'pending',
        winner: null,
        isThirdPlace: false,
      });
      ids.push(id);
    }
    roundMatchIds.push(ids);

    // Wire previous round winners into this round
    const prevIds = roundMatchIds[round - 1]!;
    for (let i = 0; i < prevIds.length; i++) {
      const prev = matches.find((m) => m.id === prevIds[i])!;
      const nextId = ids[Math.floor(i / 2)]!;
      prev.nextMatchId = nextId;
      prev.nextCorner = i % 2 === 0 ? 'red' : 'white';
    }

    // Auto-advance walkover winners from previous round
    for (const prevId of prevIds) {
      const prev = matches.find((m) => m.id === prevId)!;
      if (prev.winner && prev.nextMatchId) {
        advanceWinner(matches, prev);
      }
    }

    prevRoundSize = thisRoundSize;
    round += 1;
  }

  const finalRound = roundMatchIds[roundMatchIds.length - 1]!;
  const finalMatchId = finalRound[0] ?? null;

  // 3rd-place from semi-final losers when we have at least 4 slots (2 semis)
  let thirdPlaceMatchId: string | null = null;
  if (bracketSize >= 4 && roundMatchIds.length >= 2) {
    const semiRound = roundMatchIds[roundMatchIds.length - 2]!;
    if (semiRound.length === 2) {
      const thirdId = idFor();
      matches.push({
        id: thirdId,
        round: -1,
        indexInRound: 0,
        red: null,
        white: null,
        status: 'pending',
        winner: null,
        isThirdPlace: true,
      });
      thirdPlaceMatchId = thirdId;
      // Stash semi refs for feedThirdPlaceFromSemis helper
      void semiRound;
    }
  }

  return {
    fieldSize,
    bracketSize,
    byeCount,
    slots,
    matches,
    finalMatchId,
    thirdPlaceMatchId,
  };
}

/** Place winner into next match corner; no-op if no nextMatchId. */
export function advanceWinner(matches: Match[], completed: Match): void {
  if (!completed.winner || !completed.nextMatchId || !completed.nextCorner) return;
  const next = matches.find((m) => m.id === completed.nextMatchId);
  if (!next) return;
  if (completed.nextCorner === 'red') next.red = completed.winner;
  else next.white = completed.winner;
}

/**
 * After both semis complete, feed losers into the 3rd-place match.
 * Returns false if prerequisites not met.
 */
export function feedThirdPlaceFromSemis(graph: BracketGraph): boolean {
  if (!graph.thirdPlaceMatchId) return false;
  const third = graph.matches.find((m) => m.id === graph.thirdPlaceMatchId);
  if (!third) return false;

  const maxRound = Math.max(
    ...graph.matches.filter((m) => !m.isThirdPlace).map((m) => m.round),
  );
  const semis = graph.matches.filter(
    (m) => !m.isThirdPlace && m.round === maxRound - 1,
  );
  if (semis.length !== 2) return false;
  if (!semis.every((s) => s.winner && (s.status === 'complete' || s.status === 'walkover'))) {
    return false;
  }

  const losers: SlotOccupant[] = [];
  for (const semi of semis) {
    const loser =
      semi.red && semi.winner && sameOccupant(semi.red, semi.winner)
        ? semi.white
        : semi.red;
    if (loser && loser.kind === 'competitor') losers.push(loser);
  }
  if (losers.length < 1) return false;

  third.red = losers[0] ?? null;
  third.white = losers[1] ?? null;
  return true;
}

function sameOccupant(a: SlotOccupant, b: SlotOccupant): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'bye') return true;
  return a.competitorId === b.competitorId;
}

/** Record a completed bout result and advance winner. */
export function completeMatch(
  graph: BracketGraph,
  matchId: string,
  winnerCorner: Corner,
): Match {
  const match = graph.matches.find((m) => m.id === matchId);
  if (!match) throw new Error(`Unknown match ${matchId}`);
  if (match.status === 'complete') throw new Error(`Match ${matchId} already complete`);

  const winner = winnerCorner === 'red' ? match.red : match.white;
  if (!winner || winner.kind !== 'competitor') {
    throw new Error(`No competitor on ${winnerCorner} for match ${matchId}`);
  }

  match.winner = winner;
  match.status = 'complete';
  advanceWinner(graph.matches, match);

  if (!match.isThirdPlace) {
    feedThirdPlaceFromSemis(graph);
  }
  return match;
}

export function getMatch(graph: BracketGraph, matchId: string): Match | undefined {
  return graph.matches.find((m) => m.id === matchId);
}

/** Pending (non-walkover) matches ready to play (both sides filled with competitors). */
export function readyMatches(graph: BracketGraph): Match[] {
  return graph.matches.filter(
    (m) =>
      m.status === 'pending' &&
      m.red?.kind === 'competitor' &&
      m.white?.kind === 'competitor',
  );
}
