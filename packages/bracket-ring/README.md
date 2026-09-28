# @ata/bracket-ring

**Owner:** ATA Build — Bracket Ring  
**Scope:** Domain-only TypeScript package (no UI).

Implements the ring-side **bracket creation wizard**, single-elim **Match graph**, mutable **ScoreEntry**, scoring **rules**, and **AuditLog** gated to closed-ring adjustments — per:

- `/workspace/ata-tournament-architecture-spec.md`
- `/workspace/ata-tournament-build-plan.md` (Bracket Ring ownership)

## No UI

This package must not contain UI, React/Vue/DOM code, or screen chrome. Design Gate D blocks all UI; Bracket Ring domain scaffolding is intentionally separate.

## Layout

```
src/
  contracts.ts          Cross-module stubs (Core Reg / Day Ops)
  scoring/rules.ts      EventType enum (locked order) + caps / forms sum
  scoring/score-entry.ts  Mutable P/W + forms digits; undoToMatchStart
  bracket/wizard.ts     BracketWizard state machine
  bracket/graph.ts      Single-elim slots/matches for field size N + 3rd place
  audit/audit-log.ts    Writer: only action closed_ring_adjustment + reason
  index.ts              Public exports
tests/                  Vitest unit tests
```

## How other owners plug in

| Peer | Contract | Direction |
|------|----------|-----------|
| **Core Reg** | `DivisionCompetitorPool` | Core Reg supplies the registered competitor pool for a Division; Bracket Ring consumes it to run the wizard / build the graph. Bracket Ring does not own Registration or payment. |
| **Day Ops** | `RingStartLockSignal` | Day Ops signals ring start → call `BracketWizard.lock({ reason: 'ring_start' })`. Bracket becomes immutable. |
| **Day Ops / Director** | `AdjustClosedRingRequest` / `adjustClosedRing` | Post-close corrections go through Day Ops; Bracket Ring’s `AuditLog.write` accepts **only** `action: 'closed_ring_adjustment'` with a required `reason`. |

Titles selected in the wizard are **ephemeral** (session memory only). Do not persist titleholder data.

## Scripts

```bash
cd /workspace/ata-bracket-ring
npm install
npm test
npm run build   # optional emit to dist/
```

## SCM note

This workspace package lives on the shared Linux box for scaffolding. It will move into the shared Origin/GitHub repo once SCM exists. No `git init` is required here.

## Non-goals (by design)

- Titleholder persistence / sync
- Immutable event log / materialized views
- UI / branding (Design ownership)
- Tournament / Registration / Ring entity ownership (Core Reg / Day Ops)
