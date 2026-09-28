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
  onRingStart?: RingStartLockHandler;
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

  callDivision(): void {
    this.assertPhase('check_in_ready');
    this.phase = 'called';
  }

  signalNeedJudge(): void {
    this.assertPhase('called');
    this.phase = 'need_judge';
  }

  hostWizard(): void {
    if (this.phase !== 'called' && this.phase !== 'need_judge') {
      throw new RingOpsError(
        `hostWizard requires phase 'called' or 'need_judge', got '${this.phase}'`,
      );
    }
    this.phase = 'hosting_wizard';
  }

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

  nextPair(): void {
    this.assertPhase('active');
    this.phase = 'next_pair';
  }

  resumeActive(): void {
    this.assertPhase('next_pair');
    this.phase = 'active';
  }

  endRing(): void {
    if (this.phase !== 'active' && this.phase !== 'next_pair') {
      throw new RingOpsError(
        `endRing requires phase 'active' or 'next_pair', got '${this.phase}'`,
      );
    }
    this.phase = 'ended';
    this.activeMode = null;
  }

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
