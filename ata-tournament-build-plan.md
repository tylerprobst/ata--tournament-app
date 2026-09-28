# ATA Tournament App — Build Plan (scaffolding kickoff)

Source of truth: `/workspace/ata-tournament-architecture-spec.md` (approved).
Status: Plan only. No coding until Architect green-lights scaffolding. **No UI code until Design approval on branding + key-screen mockups.**

## Build team ownership

| Owner | Modules / surfaces |
|---|---|
| **ATA Build - Core Reg** | Tournament, Division, EventType (fixed 8, Forms before Weapons for Creative/Extreme), Competitor, **atomic Registration+Payment**, degree rank tiers (color belt / 1st / 2nd–3rd / 4th–5th degree, regional cap 5th) |
| **ATA Build - Bracket Ring** | **Bracket creation wizard** (championship titles → title-holder byes or fully random; leftover byes random; live reorder by scorekeeper/judges/timekeeper; mutable until ring start then locked; titles ephemeral), Match, ScoreEntry (**plain mutable state**), **AuditLog (closed-ring adjustments only)**, Scoring rules (forms 1–9×3; sparring first-to-cap trad 5 / combat 10) |
| **ATA Build - Day Ops** | Ring, RingRole, RingOperations flows, JudgeAssignment, Schedule (high-degree-first), DirectorDashboard, Teams stub |
| **ATA Build - Design** | **Branding and visual design:** app identity, color palette, typography, iconography, and UI mockups for bracket wizard, registration flow, ring-day director dashboard, and scorekeeper interface. Concepts + mockups **before any UI code**. |
| **ATA Tournament App - Architect** | Spec ownership, cross-module contracts, open-question decisions, green-light gates (including **Design approval** before UI implementation) |

## Event schedule catalog (locked)

1. Traditional forms  
2. Traditional weapons  
3. Combat sparring  
4. Traditional sparring  
5. Creative forms  
6. Creative weapons  
7. Extreme forms  
8. Extreme weapons  

Ranked tiers use **degree**, not dan.

## Design workstream (new)

**Goal:** Establish visual identity and approved mockups before any UI is coded.

**Deliverables:**
1. App identity (name treatment / mark direction for the tournament app)
2. Color palette (including red/white corner affordances and status colors for live rings)
3. Typography scale (tablet scorekeeper + phone judge/director)
4. Iconography set (events, roles, lock/mutable, need-judge, audit)
5. UI mockups for key screens:
   - Bracket wizard (title question → generate → live reorder → lock)
   - Registration flow (atomic pay+reg)
   - Ring-day director dashboard (active/queued rings, judge bench)
   - Scorekeeper interface (sparring points/warnings + forms three-digit entry)

**Sequencing:** Design runs in parallel with M0/M1 **domain** scaffolding (types, entities, transactions with no UI). **UI implementation is blocked on Design approval.**

### Design-dependent milestones (flagged)

| Milestone | Domain / backend | UI / screens |
|---|---|---|
| **M0** | Align owners | Design absorbs spec; starts identity concepts |
| **M1** | Core skeleton (enums, entities, `commitRegistration`) — **not design-blocked** | Registration **UI** — **blocked on Design approval** of registration mockups + palette/type |
| **M2** | Bracket wizard **state machine** + Match/ScoreEntry/AuditLog — **not design-blocked** | Bracket wizard **UI** + scorekeeper sparring/forms chrome — **blocked on Design approval** of wizard + scorekeeper mockups |
| **M3** | Ring / RingRole / assignment / schedule shells — **not design-blocked** | Ring tablet shells — **blocked on Design approval** of scorekeeper + ring chrome |
| **M4** | Vertical wire-throughs (API/domain) — **not design-blocked** | End-to-end **UI** slices — **blocked until Design approval** for the screens in that slice |
| **M5** | Director reopen + Teams stub domain — **not design-blocked** | Director dashboard **UI** — **blocked on Design approval** of director mockups |

**Gate D (Design approval):** Architect + Tyler sign off on identity, palette, type, icons, and the four key-screen mockups before any UI code for those surfaces.

## Sequencing (milestones)

### M0 — Align (now)
Distribute approved spec; each owner confirms boundaries and lists scaffolding touchpoints. Design starts branding concepts from the same spec. **No production code. No UI code.**

### M0.5 — Design concepts (parallel with M0/M1 domain)
Design produces identity directions, palette, typography, iconography, and first-pass mockups for the four key screens. Review loop with Architect/Tyler. Ends at **Gate D**.

### M1 — Core skeleton (domain)
Core Reg scaffolds Tournament / Division / EventType / Competitor / Registration with **atomic pay+reg** and degree tier enums.  
**⚠ Registration UI waits on Gate D.**

### M2 — Bracket wizard + mutable scoring (domain)
Bracket Ring scaffolds Bracket wizard logic, Match/ScoreEntry mutable updates, closed-ring-only AuditLog hook.  
**⚠ Bracket wizard UI and scorekeeper UI wait on Gate D.**

### M3 — Ring day shell (domain)
Day Ops scaffolds Ring + RingRole, ring-start / need-judge / next-pair shells, JudgeAssignment stubs, Schedule slot ordering (high degree first).  
**⚠ Ring tablet UI waits on Gate D.**

### M4 — Wire-through vertical slices
Domain slices can proceed on APIs. **UI wire-throughs require Gate D** for each screen involved:
1. Register+pay → appear in Division  
2. Wizard → locked bracket → live sparring point mutate  
3. Forms baseline + three-digit entry → sum  
4. Close ring → adjust closed ring → AuditLog entry  

### M5 — Director + Teams stub
DirectorDashboard domain + Teams registration stub.  
**⚠ Director dashboard UI waits on Gate D.**

## First milestones (immediate)

1. Shared types: EventType enum (order above), RankTier (degree), Registration commit shape (atomic payment). *(domain — not design-blocked)*  
2. BracketWizard state machine: ask titles → branch → generate → reorder → lock. *(domain — not design-blocked)*  
3. AuditLog writer gated: only `closed_ring_adjustment`. *(domain — not design-blocked)*  
4. Empty RingOperations shell that can host wizard then sparring/forms modes. *(domain — not design-blocked)*  
5. **Design:** identity + palette + type + icons + mockups for wizard / registration / director / scorekeeper → **Gate D**. *(blocks all UI code)*

## Explicit non-goals for first scaffold

- Titleholder persistence / sync  
- Immutable event log / materialized views / sub-second replay  
- Paid-without-reg or reg-without-pay states  
- Deep Teams product  
- Coding before Architect green light  
- **UI code before Design approval (Gate D)**  

## Gates

1. **M0 gate:** Architect reviews M0 confirmations from Core Reg, Bracket Ring, and Day Ops, then green-lights M1 **domain** scaffolding.  
2. **Gate D (Design):** Architect + Tyler approve branding and the four key-screen mockups, then green-light **UI** implementation for those surfaces.
