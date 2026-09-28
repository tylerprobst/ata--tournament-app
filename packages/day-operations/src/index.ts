/** @ata/day-operations — domain only. No UI. */

export type {
  CompetitorRef,
  DivisionCompetitorPool,
  JudgePoolEntry,
  RingStartLockSignal,
  RingStartLockHandler,
  AdjustClosedRingRequest,
  AdjustClosedRingHandler,
} from './contracts.js';

export {
  Ring,
  RingError,
  RingStatus,
  CreateRingInput,
  createRing,
  assignDivision,
  setRingStatus,
} from './ring.js';

export {
  RingRole,
  RingRoleError,
  RingRoleType,
  AssignmentWindow,
  CreateRingRoleInput,
  createRingRole,
} from './ring-role.js';

export {
  JudgeAssignment,
  JudgeAssignmentError,
  JudgeRole,
  JudgeAssignmentStatus,
  JudgeAssignmentWindow,
  CreateJudgeAssignmentInput,
  createJudgeAssignment,
  assignFromJudgePool,
  noOverlap,
  validateNoOverlap,
} from './judge-assignment.js';

export {
  ScheduleSlot,
  ScheduleError,
  ScheduleSlotStatus,
  RankTier,
  RANK_TIER_PRIORITY,
  OrderScheduleSlotsOptions,
  orderScheduleSlotsHighDegreeFirst,
  localTimeToMinutes,
  createScheduleSlot,
  generateSchedule,
} from './schedule.js';

export {
  RingOperations,
  RingOpsError,
  RingOpsPhase,
  ActiveMode,
  RingOperationsConfig,
  RingOperationsSnapshot,
} from './ring-operations.js';

export type {
  RingStartSignal,
  NeedJudgeAlert,
  NextPairPrompt,
} from './ring-operations.js';

export {
  DirectorDashboard,
  DirectorDashboardError,
  RingListItem,
  BenchJudge,
  ReopenClosedRingInput,
  filterNonCompetingAssignments,
} from './director-dashboard.js';

export {
  Team,
  TeamStatus,
  RegisterTeamUnitInput,
  TeamsError,
  registerTeamUnit,
} from './teams.js';
