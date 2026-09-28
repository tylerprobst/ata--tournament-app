# @ata/day-operations

**Owner:** ATA Build — Day Ops  
**Scope:** Domain-only TypeScript package (no UI).

Implements **Ring**, **RingRole**, **RingOperations** shell, **JudgeAssignment** (real no-overlap), **Schedule** (high-degree-first + after-noon color belts), **DirectorDashboard**, and **Teams** unit-registration stub — per:

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
  judge-assignment.ts       Panel assign + noOverlap (real implementation)
  schedule.ts               ScheduleSlot + orderScheduleSlotsHighDegreeFirst
  ring-operations.ts        Live-day state machine + RingStartLockSignal emit
  director-dashboard.ts     Active/queued + bench + reopenClosedRing
  teams.ts                  Team unit register stub only
  index.ts                  Public exports
tests/                      Vitest unit tests
```

## Key domain rules

1. **One Ring = one Division** for a given assignment window.
2. **RingRole types:** timekeeper, scorekeeper (distinct from judges; ring context not device).
3. **No-overlap constraint:** real `noOverlap(personId, competeRingIds, judgeRingId)` — person may not judge a ring where still competing.
4. **Schedule ordering:** `orderScheduleSlotsHighDegreeFirst` with RankTier priority (4th/5th → 2nd/3rd → 1st → color_belt); color belts after configurable noon milestone (default 12:00).
5. **RingOperations state machine:** check_in_ready → called → need_judge → hosting_wizard → active → next_pair → ended → reopen_stub. On transition to active: emits RingStartLockSignal.
6. **DirectorDashboard:** lists active/queued rings, non-competing bench, `reopenClosedRing` builds AdjustClosedRingRequest (required non-empty reason).
7. **Teams:** unit registration only (no deep member→Division sync).

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

## Non-goals (by design)

- UI / React / DOM
- BracketWizard / Match / ScoreEntry / AuditLog writer (Bracket Ring)
- Registration / atomic pay (Core Reg)
- Deep Teams member→Division sync
- Immutable event log / sub-second replay
