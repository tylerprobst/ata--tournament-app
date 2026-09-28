/**
 * Ring operations contracts for Day Ops / Bracket Ring integration.
 */

/**
 * Signal to Bracket Ring that a ring has started (must lock bracket).
 * Day Ops invokes this when transitioning Ring to active.
 */
export interface RingStartSignal {
  ringId: string;
  divisionId: string;
  startedAtMs: number;
}

/**
 * Need-judge alert to Director Dashboard.
 * Day Ops emits when a ring cannot start due to missing judge panel.
 */
export interface NeedJudgeAlert {
  ringId: string;
  divisionId: string;
  requiredRole: 'center' | 'corner';
  panelPosition?: number;
}

/**
 * Next-pair prompt for ring after a match completes.
 * Day Ops / Ring Ops surfaces the next ready match to scorekeeper/judges.
 */
export interface NextPairPrompt {
  ringId: string;
  matchId: string;
  redCompetitorName: string;
  whiteCompetitorName: string;
}
