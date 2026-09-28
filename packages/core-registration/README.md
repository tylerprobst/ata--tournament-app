# @ata/core-registration

**Owner:** ATA Build — Core Registration  
**Scope:** Domain-only TypeScript package (no UI).

Implements **Tournament**, **Division** (age/gender/rank eligibility), **EventType** catalog (locked order), **Competitor** (degree-based tiers, regional cap 5th degree), and **atomic Registration + Payment** (no limbo states) — per:

- `/workspace/ata-tournament-architecture-spec.md`
- `/workspace/ata-tournament-build-plan.md` (Core Reg ownership)

## No UI

This package must not contain UI, React/Vue/DOM code, or screen chrome. Design Gate D blocks all UI; Core Reg domain scaffolding is intentionally separate.

## Layout

```
src/
  event-type.ts         EventType enum (locked order) + helpers
  rank-tier.ts          RankTier (color / 1st / 2nd–3rd / 4th–5th degree), regional cap
  tournament.ts         Tournament entity
  competitor.ts         Competitor (degree-based, blocks 6th+ at regional)
  division.ts           Division (EventType + age/gender/rank facets)
  registration.ts       Atomic registration + payment (no limbo)
  index.ts              Public exports
tests/                  Vitest unit tests
```

## Key domain rules

1. **EventType order locked:** Traditional forms → Traditional weapons → Combat sparring → Traditional sparring → Creative forms → Creative weapons → Extreme forms → Extreme weapons.
2. **Degree-based tiers:** Color belt (0), 1st (1), 2nd–3rd (2–3), 4th–5th (4–5). Regional cap: 5th degree max.
3. **6th+ degree blocked at regional registration:** `createCompetitor` throws for `currentDegree >= 6`.
4. **Atomic registration + payment:** `commitRegistration` requires `paymentConfirmed: true`. No paid-without-reg or reg-without-pay states.

## How other owners plug in

| Peer | Contract | Direction |
|------|----------|-----------|
| **Bracket Ring** | `DivisionCompetitorPool` | Core Reg supplies registered competitor pool for a Division; Bracket Ring builds the bracket/wizard. |
| **Day Ops** | `Registration.judgePreferences` | Core Reg captures judge willingness (center vs corner); Day Ops consumes for `JudgeAssignment`. |

## Scripts

```bash
cd /workspace/packages/core-registration
npm install
npm test
npm run build   # optional emit to dist/
```

## Non-goals (by design)

- Titleholder persistence (Bracket Ring ownership)
- UI / branding (Design ownership)
- Ring / Match / Bracket entities (Bracket Ring / Day Ops ownership)
