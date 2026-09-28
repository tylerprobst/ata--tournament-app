# @ata/day-operations

**Owner:** ATA Build — Day Operations  
**Scope:** Domain-only TypeScript package (no UI).

Implements **Ring** (one Division at a time), **RingRole** (timekeeper/scorekeeper), **JudgeAssignment** (no-overlap constraint stub), and **Schedule** (high-rank-first heuristic stub) — per:

- `/workspace/ata-tournament-architecture-spec.md`
- `/workspace/ata-tournament-build-plan.md` (Day Ops ownership)

## No UI

This package must not contain UI, React/Vue/DOM code, or screen chrome. Design Gate D blocks all UI; Day Ops domain scaffolding is intentionally separate.

## Layout

```
src/
  ring.ts               Ring entity (one Division per window)
  ring-role.ts          RingRole (timekeeper, scorekeeper)
  judge-assignment.ts   JudgeAssignment (center/corner, no-overlap stub)
  schedule.ts           ScheduleSlot (high-rank-first stub)
  ring-operations.ts    Contracts (RingStartSignal, NeedJudgeAlert, NextPairPrompt)
  index.ts              Public exports
tests/                  Vitest unit tests
```

## Key domain rules

1. **One Ring = one Division** for a given assignment window.
2. **RingRole types:** timekeeper, scorekeeper (distinct from judges).
3. **No-overlap constraint:** a person may not judge a ring where they are still an active competitor. M1 stub: `validateNoOverlap` always returns true (full check deferred).
4. **Schedule generation stub:** `generateSchedule` returns empty array for M1; full scheduler with high-rank-first logic deferred.

## How other owners plug in

| Peer | Contract | Direction |
|------|----------|-----------|
| **Bracket Ring** | `RingStartSignal` | Day Ops signals ring start → Bracket Ring locks the bracket. |
| **Core Reg** | `JudgeAssignment` ← `Registration.judgePreferences` | Day Ops consumes judge pool from Core Reg registrations. |
| **Director Dashboard** | `NeedJudgeAlert`, `NextPairPrompt` | Day Ops emits alerts/prompts for live ring execution. |

## Scripts

```bash
cd /workspace/packages/day-operations
npm install
npm test
npm run build   # optional emit to dist/
```

## Non-goals (by design)

- Full schedule generation (M1 stub only)
- No-overlap full validation (M1 stub; requires competitor-in-division lookup)
- UI / branding (Design ownership)
- Bracket / Match / ScoreEntry entities (Bracket Ring ownership)
