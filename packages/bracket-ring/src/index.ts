/** @ata/bracket-ring — domain only. No UI. */

export {
  EventType,
  EVENT_TYPE_ORDER,
  FORMS_DIGIT_MIN,
  FORMS_DIGIT_MAX,
  FORMS_JUDGE_COUNT,
  TRADITIONAL_SPARRING_CAP,
  COMBAT_SPARRING_CAP,
  isFormsOrWeapons,
  isSparring,
  sparringCap,
  capReached,
  assertFormsDigit,
  sumFormsDigits,
  type FormsDigits,
} from './scoring/rules.js';

export {
  ScoreEntry,
  ScoreEntryError,
  type SparringKind,
  type Side,
  type SparringTick,
} from './scoring/score-entry.js';

export {
  BracketWizard,
  WizardError,
  type WizardPhase,
  type WizardSnapshot,
} from './bracket/wizard.js';

export {
  buildSingleElimGraph,
  nextPowerOfTwo,
  advanceWinner,
  feedThirdPlaceFromSemis,
  completeMatch,
  getMatch,
  readyMatches,
  type Corner,
  type MatchStatus,
  type SlotOccupant,
  type BracketSlot,
  type Match,
  type BracketGraph,
} from './bracket/graph.js';

export {
  AuditLog,
  AuditLogError,
  CLOSED_RING_ADJUSTMENT,
  type AuditAction,
  type AuditLogEntry,
  type WriteClosedRingAdjustmentInput,
} from './audit/audit-log.js';

export type {
  BracketCompetitorRef,
  DivisionCompetitorPool,
  RingStartLockSignal,
  AdjustClosedRingRequest,
  AdjustClosedRingHandler,
} from './contracts.js';
