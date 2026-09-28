/** @ata/day-operations — domain only. No UI. */

export {
  createRing,
  assignDivision,
  setRingStatus,
  type Ring,
  type RingStatus,
  type CreateRingInput,
} from './ring.js';

export {
  createRingRole,
  type RingRole,
  type RingRoleType,
  type AssignmentWindow,
  type CreateRingRoleInput,
} from './ring-role.js';

export {
  createJudgeAssignment,
  assignFromJudgePool,
  noOverlap,
  JudgeAssignmentError,
  type JudgeRole,
  type JudgeAssignmentStatus,
  type JudgeAssignmentWindow,
  type JudgeAssignment,
  type CreateJudgeAssignmentInput,
} from './judge-assignment.js';

export {
  RANK_TIER_PRIORITY,
  localTimeToMinutes,
  orderScheduleSlotsHighDegreeFirst,
  ScheduleError,
  type RankTier,
  type ScheduleSlotStatus,
  type ScheduleSlot,
  type OrderScheduleSlotsOptions,
} from './schedule.js';

export {
  RingOperations,
  RingOpsError,
  type RingOpsPhase,
  type ActiveMode,
  type RingOperationsConfig,
  type RingOperationsSnapshot,
} from './ring-operations.js';

export {
  DirectorDashboard,
  DirectorDashboardError,
  filterNonCompetingAssignments,
  type RingListItem,
  type BenchJudge,
  type ReopenClosedRingInput,
} from './director-dashboard.js';

export {
  registerTeamUnit,
  TeamsError,
  type Team,
  type TeamStatus,
  type RegisterTeamUnitInput,
} from './teams.js';

export type {
  CompetitorRef,
  DivisionCompetitorPool,
  JudgePoolEntry,
  RingStartLockSignal,
  RingStartLockHandler,
  AdjustClosedRingRequest,
  AdjustClosedRingHandler,
} from './contracts.js';
