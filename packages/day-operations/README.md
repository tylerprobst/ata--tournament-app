# @ata/day-operations

**Owner:** ATA Build — Day Operations  
**Scope:** Domain-only TypeScript package (no UI).

Implements **Ring**, **RingRole**, **RingOperations** shell, **JudgeAssignment** (no-overlap), **Schedule** (high-degree-first + after-noon color belts), **DirectorDashboard** stubs, and **Teams** unit-registration stub — per:

- `/workspace/ata-tournament-architecture-spec.md`
- `/workspace/ata-tournament-build-plan.md` (Day Ops ownership)

## No UI

This package must not contain UI, React/Vue/DOM code, or screen chrome. Design Gate D blocks all UI; Day Ops domain scaffolding is intentionally separate.

## Layout

```
src/
  contracts.ts              Cross-module stubs (Core Reg / Bracket Ring)
  ring.ts                   Ring entity (idle|active|held; one Division/window)
  ring-role.ts              timekeeper | scorekeeper (ring context, not device)
  judge-assignment.ts       Panel assign + noOverlap helper
  schedule.ts               ScheduleSlot + orderScheduleSlotsHighDegreeFirst
  ring-operations.ts        Live-day state machine + RingStartLockSignal emit
  director-dashboard.ts     Active/queued + bench + reopenClosedRing
  teams.ts                  Team unit register stub only
  index.ts                  Public exports
tests/                      Vitest unit tests
```

## How other owners plug in

| Peer | Contract | Direction |
|------|----------|-----------|
| **Core Reg** | `DivisionCompetitorPool` / `JudgePoolEntry` | Core Reg supplies competitor + judge pools (willing, preferredRole). Day Ops does not own Registration or atomic pay. |
| **Bracket Ring** | `RingStartLockSignal` | Day Ops `RingOperations.startRing` emits lock signal → Bracket Ring `BracketWizard.lock({ reason: 'ring_start' })`. |
| **Bracket Ring** | `AdjustClosedRingRequest` | Director `reopenClosedRing` builds the request (reason required) → Bracket Ring `AuditLog.write` (`closed_ring_adjustment` only). |

## Scripts

```bash
cd /workspace/packages/day-operations
npm install
npm test
npm run build   # optional emit to dist/
```

## Domain features

### Schedule ordering (high-degree-first)
- **RankTier priority:** `fourth_fifth_degree` (0) → `second_third_degree` (1) → `first_degree` (2) → `color_belt` (3)
- **Color belt after noon:** `orderScheduleSlotsHighDegreeFirst` queues color belts at/after the noon milestone (default `"12:00"`); higher degrees scheduled in morning slots
- **Stable within band:** sequenceOrder + id fallback for deterministic ordering

### JudgeAssignment no-overlap
- **Hard rule:** `noOverlap(personId, competeRingIds, judgeRingId)` returns `false` when `judgeRingId` is in the person's active compete rings
- **assignFromJudgePool:** requires `willing: true` from `JudgePoolEntry`; uses `preferredRole` unless overridden

### RingOperations state machine
- **Phase flow:** `check_in_ready` → `called` → `need_judge` → `hosting_wizard` → `active` → `next_pair` → `ended` → `reopen_stub`
- **RingStartLockSignal emission:** `startRing(mode)` transitions to `active` and emits the lock signal (Bracket Ring must freeze the bracket)
- **ActiveMode:** `sparring` or `forms` (stub only; full scoring is Bracket Ring)

### DirectorDashboard
- **Active/queued rings:** `listActiveAndQueuedRings()` returns rings with `status: 'active'` first, then idle/held with a division assigned
- **Non-competing bench:** `nonCompetingJudgeBench()` filters judges with `nonCompeting: true`
- **Reopen closed ring:** `reopenClosedRing(input)` requires non-empty `reason` and builds `AdjustClosedRingRequest` for Bracket Ring AuditLog

### Teams stub
- **Unit registration:** `registerTeamUnit(input)` validates name and tournamentId; returns Team with `status: 'registered'`
- **No member sync:** does NOT sync members into Division rings (deferred product scope)

## Non-goals (by design)

- UI / React / DOM
- BracketWizard / Match / ScoreEntry / AuditLog writer (Bracket Ring)
- Registration / atomic pay (Core Reg)
- Deep Teams member→Division sync
- Immutable event log / sub-second replay
