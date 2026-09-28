/**
 * RingOperations shell state machine.
 *
 * check_in_ready → called → need_judge → hosting_wizard (pre-start)
 *   → active (sparring | forms mode stubs) → next_pair stub → ended → reopen_stub
 *
 * On transition to active: emit RingStartLockSignal (Bracket Ring lock).
 */

import type {
  RingStartLockHandler,
  RingStartLockSignal,
} from './contracts.js';

export type RingOpsPhase =
  | 'check_in_ready'
  | 'called'
  | 'need_judge'
  | 'hosting_wizard'
  | 'active'
  | 'next_pair'
  | 'ended'
  | 'reopen_stub';

export type ActiveMode = 'sparring' | 'forms';

export interface RingOperationsConfig {
  tournamentId: string;
  ringId: string;
  divisionId: string;
  bracketId: string;
  /** Called once when transitioning to active (Bracket Ring lock). */
  onRingStart?: RingStartLockHandler;
  /** Clock for startedAtMs; defaults to Date.now. */
  nowMs?: () => number;
}

export interface RingOperationsSnapshot {
  phase: RingOpsPhase;
  activeMode: ActiveMode | null;
  lastLockSignal: RingStartLockSignal | null;
}

export class RingOpsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RingOpsError';
  }
}

/**
 * Live ring-day execution shell.
 * Hosts Bracket wizard in hosting_wizard; sparring/forms are mode stubs only.
 */
export class RingOperations {
  private phase: RingOpsPhase = 'check_in_ready';
  private activeMode: ActiveMode | null = null;
  private lastLockSignal: RingStartLockSignal | null = null;
  private readonly config: RingOperationsConfig;
  private readonly nowMs: () => number;

  constructor(config: RingOperationsConfig) {
    this.config = config;
    this.nowMs = config.nowMs ?? (() => Date.now());
  }

  getPhase(): RingOpsPhase {
    return this.phase;
  }

  getActiveMode(): ActiveMode | null {
    return this.activeMode;
  }

  getLastLockSignal(): RingStartLockSignal | null {
    return this.lastLockSignal;
  }

  snapshot(): RingOperationsSnapshot {
    return {
      phase: this.phase,
      activeMode: this.activeMode,
      lastLockSignal: this.lastLockSignal,
    };
  }

  /** Call division to the ring. */
  callDivision(): void {
    this.assertPhase('check_in_ready');
    this.phase = 'called';
  }

  /** Need-judge alert path (director bench). */
  signalNeedJudge(): void {
    this.assertPhase('called');
    this.phase = 'need_judge';
  }

  /** Proceed to host Bracket wizard (pre-start). From called or need_judge. */
  hostWizard(): void {
    if (this.phase !== 'called' && this.phase !== 'need_judge') {
      throw new RingOpsError(
        `hostWizard requires phase 'called' or 'need_judge', got '${this.phase}'`,
      );
    }
    this.phase = 'hosting_wizard';
  }

  /**
   * Start the ring → active. Emits RingStartLockSignal for Bracket Ring.
   * mode selects sparring or forms stub.
   */
  startRing(mode: ActiveMode): RingStartLockSignal {
    this.assertPhase('hosting_wizard');
    const signal: RingStartLockSignal = {
      tournamentId: this.config.tournamentId,
      ringId: this.config.ringId,
      divisionId: this.config.divisionId,
      bracketId: this.config.bracketId,
      startedAtMs: this.nowMs(),
    };
    this.lastLockSignal = signal;
    this.activeMode = mode;
    this.phase = 'active';
    this.config.onRingStart?.(signal);
    return signal;
  }

  /** Next-pair stub after a bout / performance. */
  nextPair(): void {
    this.assertPhase('active');
    this.phase = 'next_pair';
  }

  /** Return to active for another bout (stub). */
  resumeActive(): void {
    this.assertPhase('next_pair');
    this.phase = 'active';
  }

  /** End / close the ring. From active or next_pair. */
  endRing(): void {
    if (this.phase !== 'active' && this.phase !== 'next_pair') {
      throw new RingOpsError(
        `endRing requires phase 'active' or 'next_pair', got '${this.phase}'`,
      );
    }
    this.phase = 'ended';
    this.activeMode = null;
  }

  /**
   * Director reopen stub after ended.
   * Actual AdjustClosedRingRequest is built via DirectorDashboard.reopenClosedRing.
   */
  reopenStub(): void {
    this.assertPhase('ended');
    this.phase = 'reopen_stub';
  }

  private assertPhase(expected: RingOpsPhase): void {
    if (this.phase !== expected) {
      throw new RingOpsError(
        `Expected phase '${expected}', got '${this.phase}'`,
      );
    }
  }
}

/**
 * Deprecated contract stubs (use contracts.ts instead).
 */
export interface RingStartSignal {
  ringId: string;
  divisionId: string;
  startedAtMs: number;
}

export interface NeedJudgeAlert {
  ringId: string;
  divisionId: string;
  requiredRole: 'center' | 'corner';
  panelPosition?: number;
}

export interface NextPairPrompt {
  ringId: string;
  matchId: string;
  redCompetitorName: string;
  whiteCompetitorName: string;
}
