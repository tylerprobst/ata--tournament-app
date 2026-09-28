/** @ata/day-operations — domain only. No UI. */

export { Ring, RingError, RingStatus, createRing, assignDivision, startRing } from './ring.js';
export {
  RingRole,
  RingRoleError,
  RingRoleType,
  createRingRole,
} from './ring-role.js';
export {
  JudgeAssignment,
  JudgeAssignmentError,
  JudgeRole,
  JudgeAssignmentStatus,
  createJudgeAssignment,
  validateNoOverlap,
} from './judge-assignment.js';
export {
  ScheduleSlot,
  ScheduleError,
  ScheduleSlotStatus,
  createScheduleSlot,
  generateSchedule,
} from './schedule.js';
export type {
  RingStartSignal,
  NeedJudgeAlert,
  NextPairPrompt,
} from './ring-operations.js';
