# ATA Tournament App — M1 Domain Scaffolding

**Owner:** ATA Build (Core Reg, Bracket Ring, Day Ops)  
**Status:** M1 domain packages complete. No UI (Design Gate D deferred).

Digitize ATA Martial Arts tournament-day operations from registration through rings, scoring, judge assignment, and director control. This repository contains **domain-only** TypeScript packages for Core Registration, Bracket Ring, and Day Operations — per:

- `/workspace/ata-tournament-architecture-spec.md`
- `/workspace/ata-tournament-build-plan.md`

## Architecture

```
packages/
  core-registration/     Tournament, Division, EventType, Competitor, atomic Registration+Payment
  bracket-ring/          Bracket wizard, Match graph, ScoreEntry, AuditLog (closed-ring only)
  day-operations/        Ring, RingRole, JudgeAssignment, Schedule (stubs)
```

## Key domain rules (M1)

1. **EventType order locked:** Traditional forms → Traditional weapons → Combat sparring → Traditional sparring → Creative forms → Creative weapons → Extreme forms → Extreme weapons.
2. **Degree-based rank tiers:** Color belt (0), 1st (1), 2nd–3rd (2–3), 4th–5th (4–5). **Regional cap: 5th degree max** — 6th+ blocked at registration.
3. **Atomic registration + payment:** no paid-without-reg or reg-without-pay limbo states.
4. **Bracket wizard:** ring-side creation with ephemeral championship titles → mutable until ring start, then locked.
5. **Mutable scoring:** plain state updates for points/warnings/forms digits; **AuditLog only for closed-ring adjustments**.
6. **One Ring = one Division** for a given assignment window.

## Install & test

```bash
# Root install (all workspaces)
npm install

# Run all tests
npm test

# Watch mode (all workspaces)
npm run test:watch

# Build all packages (optional TypeScript emit)
npm run build
```

### Per-package commands

```bash
cd packages/core-registration
npm test

cd ../bracket-ring
npm test

cd ../day-operations
npm test
```

## Non-goals for M1

- Titleholder persistence / sync
- Immutable event log / materialized views / sub-second replay
- Deep Teams product (stub only)
- UI / branding (Design Gate D)
- Full schedule generation (stub only)
- No-overlap full validation (stub only)

## Cross-module contracts

| From | To | Contract |
|------|----|----|
| Core Reg → Bracket Ring | `DivisionCompetitorPool` | Registered competitor pool for bracket wizard |
| Day Ops → Bracket Ring | `RingStartSignal` | Signal to lock bracket at ring start |
| Core Reg → Day Ops | `JudgePreferences` | Judge willingness (center/corner) for assignment |

## Testing

All packages have passing tests. Run `npm test` at root or in any package directory.

## Repository structure

- `packages/core-registration/` — Core Registration domain
- `packages/bracket-ring/` — Bracket Ring domain (from attached stubs)
- `packages/day-operations/` — Day Operations domain (stubs/contracts)
- `ata-tournament-architecture-spec.md` — Architecture spec (approved)
- `ata-tournament-build-plan.md` — Build plan (M0–M5 roadmap)

## Next milestones

- **M2:** Bracket wizard UI + scorekeeper sparring/forms chrome (blocked on Design Gate D)
- **M3:** Ring tablet shells (blocked on Design Gate D)
- **M4:** Wire-through vertical slices (register+pay → appear in Division; wizard → live scoring)
- **M5:** Director dashboard + Teams stub (blocked on Design Gate D for UI)

## License

UNLICENSED (private)
