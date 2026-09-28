# ATA Tournament App — Architecture Spec (First Pass)

Owner: ATA Tournament App - Architect  
Product owner: Tyler Probst  
Status: **Complete parallel pass + call decisions (bracket wizard, atomic reg+pay, mutable state / closed-ring audit only).** Assembled from voice requirements, paper Traditional/Combat Sparring sheets, and all four orange helpers (Data Model, Modules, Ring Ops, Schedule NFR).

## 1. Purpose

Digitize ATA Martial Arts tournament-day operations from registration through rings, scoring, judge assignment, and director control. Sparring still uses single-elim with red/white corners, points/warnings, and 3rd-place consolation (familiar from ATA paper sheets), but brackets are created by a ring-side wizard and are mutable until ring start, then locked. The app must be offline-capable, touch-friendly, and faster than paper on the day.

## 2. Data Model

# DATA MODEL

Architecture prose only. Entities, key fields, relationships, and scoring rules for the ATA Tournament App. No schema or implementation.

## Tournament

A Tournament is one hosted event (single day or multi-day) under which all competition is organized.

Key fields: display name, venue, start and end datetime, status (planned, in progress, complete), and optional notes for organizers.

Relationships: owns many Divisions, Rings, Registrations, ScheduleSlots, JudgeAssignments, and AuditLog entries. Teams register against a Tournament. Competitors appear at a Tournament only through Registration (and optional Team membership).

## EventType

Exactly eight EventTypes. These are fixed catalog values, not free text:

1. Traditional forms
2. Traditional weapons
3. Combat sparring
4. Traditional sparring
5. Creative forms
6. Creative weapons
7. Extreme forms
8. Extreme weapons

Each EventType carries a scoring profile (see Scoring rules). Sparring types use bracketed Matches. Forms and weapons types use ordered performances scored by judges. A Division is always for exactly one EventType.

## Division

A Division is the competition bucket that fills one Ring for the day: one EventType plus eligibility facets that define who may enter.

Age bands: Tiny Tigers through 60+ (contiguous organizer-defined bands covering that full range).

Gender: split as required by tournament policy (typically male / female; co-ed only if explicitly allowed for that Division).

Rank tiers:

- Color belt
- 1st degree
- 2nd–3rd degree
- 4th–5th degree

Regional cap: competition at this app’s regional level stops at 5th degree (higher degrees are out of scope for these Divisions).

Key fields: Tournament, EventType, age band, gender, rank tier, display label, status, and the Ring assigned to host it (one Ring = one Division).

Relationships: has many Registrations (competitors entered into this Division), exactly one Ring for tournament-day hosting, zero or one Bracket when the EventType is sparring, and ScheduleSlots that place the Division on the day timeline. Forms/weapons Divisions still use the same Ring model; they do not use a 16-slot Bracket, but they do produce ordered performances and ScoreEntries under the forms/weapons scoring rules.

## Competitor

A Competitor is a person who may register for Divisions and optionally flag willingness to judge.

Key fields: display name, date of birth (or age as derived for divisioning), gender, current rank (mapped into the rank tiers above), school / instructor, optional external membership identifier, and contact fields needed for registration and day-of lookup.

Relationships: has many Registrations across Divisions and Tournaments; may belong to a Team for a given Tournament; may receive JudgeAssignments when flagged as willing to judge.

## Registration

Registration is how a Competitor enters a Tournament and its Divisions. Two channels exist:

- Online pre-registration before the event
- At-door registration on an iPad at check-in

**Atomic registration + payment:** registration and payment are a single transaction. A competitor is never registered without full payment, and never paid without being registered. There is no “paid but not registered” or “registered but not paid” limbo state; that seam does not exist.

Key fields: Competitor, Tournament, channel (online vs at-door), timestamp, status (draft [pre-commit only], registered/checked in, scratched), the set of Division entries selected, and judge-interest flags:

- Willing to judge (yes / no)
- Preferred judge role: center vs corner (when willing)

Payment confirmation is part of the commit that creates the Registration; there is no separate unpaid-registered or paid-unregistered status.

A single Registration may cover multiple Divisions for the same Competitor at one Tournament. Team Registrations are separate (see Team stub) and later sync members into individual Division rings.

Relationships: links Competitor to Tournament and to one or more Division entries; feeds Bracket creation for sparring Divisions and performance order for forms/weapons Divisions; judge flags feed the pool used by JudgeAssignment.

## Ring

A Ring is the physical competition space. Rule: one Ring hosts exactly one Division for a given assignment window.

That Division may be bracketed sparring or scored forms/weapons. The Ring does not change identity when the EventType changes; the assigned Division carries the EventType and scoring mode.

Key fields: Tournament, label (e.g. Ring 3), location notes, status (idle, active, held).

Relationships: assigned to one Division at a time; has RingRoles (timekeeper, scorekeeper) staffed for the day; hosts Matches (sparring) or scored performances (forms/weapons); appears on ScheduleSlots.

## RingRole

Staff roles attached to a Ring for tournament-day operations.

Allowed roles: timekeeper, scorekeeper.

Key fields: Ring, role type, assigned person (staff or Competitor acting as staff), assignment window.

Relationships: belongs to one Ring; distinct from JudgeAssignment (judges score; RingRole runs the table clock and score entry). Ambiguity flagged below if scorekeeper and corner/center judge overlap in practice.

## Bracket

A Bracket is the single-elimination competition graph for one sparring Division (red/white corners, points/warnings per bout, 3rd-place consolation). Familiar ATA paper cues remain for ring staff UX; the digital bracket is not a fixed-size paper-sheet clone.

**Bracket creation (ring-side wizard):** owned as a Bracket creation flow at the ring before competition starts.
1. First question: do any competitors have championship titles (state, district, or world)?
2. If **no**: generate a random bracket with random bye placement.
3. If **yes**: staff select which competitors hold titles for this event. Title holders automatically receive byes. If byes remain after title holders are placed, assign the remaining byes randomly.
4. After generation, the scorekeeper, judges, or timekeeper may **manually reorder** the bracket live.
5. **Mutability:** the bracket is mutable until the ring starts, then locked. Replace any prior “fixed-size paper-bracket invariant” with this rule: **bracket is mutable until ring start, then locked.**

**Titles are ephemeral for this event only.** Do not persist or store title data. There is no titleholder database or sync for now. Title selection exists only inside the wizard session that generates the bracket.

Key fields: Division (sparring EventType only), field size N, bye count, lock state (mutable | locked at ring start), status (blank, generated, in progress, complete). Optional sheet/packet number for secretary handoff if still used operationally.

Relationships: owns bracket slots (seed/order index + Red/White + occupant competitor or Bye), owns Matches including the 3rd-place consolation, produces Placements (1st, 2nd, 3rd). Forms/weapons Divisions do not instantiate a Bracket.

## Match

A Match is one sparring bout within a Bracket (including walkovers when one side is a Bye, and the 3rd-place consolation).

Key fields: Bracket, round/stage, Red side and White side (competitors or Bye via slots), status (pending, in progress, complete, walkover), winner, Ring (inherited from Division’s Ring), and timestamps for start/end.

Relationships: belongs to one Bracket; has many ScoreEntries (P/W ticks and any cap-reaching events); advances winner into the next Bracket slot toward 1st place; semi-final losers feed the 3rd-place Match.

## ScoreEntry

A ScoreEntry is one recorded scoring fact against a Match or a forms/weapons performance.

For sparring: kind is Point or Warning, side is Red or White, ordinal within the Match, optional judge attribution, and whether the Point contributed to reaching the EventType cap.

For forms/weapons: kind is judge score digit 1–9 from one judge on one performance, with judge identity and sequence (including baseline vs relative phase).

Relationships: belongs to a Match (sparring) or to a performance under a forms/weapons Division; for forms/weapons, three judges’ digits sum to the performance total. Routine score updates mutate ScoreEntry in place (no event log). AuditLog is written only when adjusting a closed ring.

## Scoring rules (attached to EventType)

**Forms and weapons** (traditional forms, traditional weapons, creative forms, creative weapons, extreme forms, extreme weapons):

- Three judges each give a single digit from 1 to 9.
- The three digits are summed for the performance total.
- The first three competitors establish the baseline for the Division.
- Subsequent competitors are scored relative to that baseline (higher/lower relative to the established range), still as 1–9 digits that sum.

**Sparring:**

- Traditional sparring: first to cap of 5 points.
- Combat sparring: first to cap of 10 points.
- Points and warnings are tracked per corner (Red/White) as on the paper P/W boxes.
- Match ends when one side reaches the EventType cap (or by walkover / disqualification rules as defined operationally).

Scoring profile is a property of EventType so Divisions inherit rules without re-entry.

## JudgeAssignment

Assigns a person to judge a Division, Ring, Match, or forms/weapons panel.

Key fields: person (Competitor or external judge), Tournament, target (Ring and/or Division), role (center vs corner), panel position for forms/weapons (three seats), time window, status.

Relationships: drawn preferentially from Registrations with willing-to-judge and center/corner flags; sits on the Ring alongside RingRoles but is not the same entity as timekeeper/scorekeeper.

## ScheduleSlot

Places a Division (and thus its Ring) on the tournament-day timeline.

Key fields: Tournament, Division, Ring, start time, end time or estimated duration, sequence order, status (scheduled, called, running, done).

Relationships: one Division’s Ring work appears as one or more ScheduleSlots (e.g. call time vs start). Used by ring ops and any public board; does not replace Bracket or Match state.

## AuditLog

**Closed-ring adjustments only.** The default data model is plain mutable state: scores, bracket order, and other live fields update in place. There is no immutable event log for routine interactions, no materialized view, and no sub-second replay concern.

An AuditLog entry is written **only when an adjustment is made to a closed ring**. That is the sole audit trigger (including director reopen corrections that change locked results). Routine registration, scoring, bracket edits before ring start, and live match play do not write audit events.

Key fields: timestamp, actor, entity type and id, action, before/after summary, reason (required for closed-ring adjustment).

## Team (stub)

A Team is an organizational registrant that has its own Registration path at a Tournament, separate from individual Competitors.

Key fields: team name, school/org, Tournament, registration channel and status, member list (Competitor references).

Behavior for v1 stub: Team registers as a unit; member sync into individual Division Rings happens later (not fully modeled here). Downstream, Team membership should not bypass Division eligibility (age, gender, rank tier, EventType).

Relationships: belongs to Tournament; lists Competitors; produces or links to Registrations that eventually seed Divisions the same way individual Registrations do once sync runs.

## Relationship summary

Tournament → EventType catalog (global), Divisions, Rings, Registrations, Teams, ScheduleSlots, JudgeAssignments, AuditLog  
Division → one EventType, one Ring, many Registrations, optional Bracket (sparring only)  
Registration → Competitor, Tournament, Division entries, judge flags  
Bracket → slots, Matches, 3rd-place consolation, ScoreEntries (sparring)  
Ring → one Division, RingRoles, JudgeAssignments, ScheduleSlots  
ScoreEntry → Match or forms/weapons performance, per EventType scoring rules

## Ambiguities

1. Age band boundaries inside “Tiny Tigers through 60+” are not enumerated (exact cut ages / names per band).
2. Whether gender is always binary split per Division or some EventTypes allow open divisions.
3. How 2nd–3rd and 4th–5th degree tiers combine when field sizes are tiny (merge policy).
4. Whether one Competitor’s Registration is one record with many Division lines, or one Registration per Division.
5. RingRule “one Ring = one Division”: is that for the whole day or per ScheduleSlot window (can a Ring run Division A morning and Division B afternoon)?
6. Overlap between scorekeeper (RingRole) and corner/center judges (JudgeAssignment) for who is allowed to write ScoreEntries.
7. Forms/weapons performance order entity is implied but not named separately from Match; confirm whether Performance (or equivalent) is a first-class entity beside Match.
8. Baseline rule for forms/weapons: are the first three always exhibition order by registration, random, or seeded; and are their scores locked before relative scoring begins?
9. Sparring: does “first to cap” require win by 2, time limits, or center-judge stoppage beyond P/W ticks?
10. Team stub sync: when members land in individual Rings, do Team fees/status remain the source of truth for payment and scratches?
11. Large fields: how bracket wizard and single-elim graph scale when competitor count is large (no fixed 16-slot paper invariant).
12. Regional 5th degree cap: are 6th+ degrees blocked at Registration, silently omitted from Division lists, or redirected to a non-regional path outside this app?



### Bracket lock rule (replaces fixed-size paper-bracket invariant)
- **Bracket is mutable until ring start, then locked.**
- Creation uses the ring-side wizard (championship-title question → title-holder byes or fully random → optional manual reorder).
- Titles selected in the wizard are ephemeral for this event only; not stored as durable titleholder data.
- UX still mirrors familiar ATA cues where useful: red/white corners, P/W grids per bout, 3rd-place consolation from semi-final losers.


## 3. Modules

## Modules (from ATA Spec - Modules)

Tournament — Purpose: top-level competition container (identity, venue/dates, lifecycle, staff linkage) and which Divisions/EventTypes are offered. Boundaries: owns tournament setup and lifecycle only; does not own brackets, scores, judge assignments, or day-of ring execution.

Division — Purpose: competitor segmentation for fair matchmaking (age, rank/belt, gender, ATA age/rank bands) and eligibility rules. Boundaries: classification only; not a schedule slot, not an EventType, and not a bracket. Competitors register into Divisions for specific EventTypes; Division does not choose format or scoring method. (Product dimensions: Tiny Tigers–60+, gender, rank tiers color/1st/2nd–3rd/4th–5th degree, regional cap 5th.)

EventType — Purpose: catalog of the eight competition kinds and format defaults consumed by Bracket and Scoring. Boundaries: rule template only. Bracket is the instance graph for a Division×EventType; Scoring applies the rules live.

Registration — Purpose: pre-day intake (online + door iPad). Feeds competitor pool and judge pool (willing, center vs corner). Registration and payment are one atomic transaction (no paid-without-reg or reg-without-pay). Boundaries: supplies pools only; does not build brackets, assign judges, or run matches. Dual-role compete+judge is allowed under no-overlap (product decision: yes).

Bracket — Purpose: competition graph (pairings, byes, advancement, next match, 3rd-place) plus ring-side **creation wizard** (championship titles? → title-holder byes or random; remaining byes random; manual reorder by scorekeeper/judges/timekeeper). Mutable until ring start, then locked. Titles ephemeral (not persisted). Boundaries: exposes next match to RingOperations; receives outcomes from Scoring. Post-lock changes only via closed-ring adjustment (AuditLog).

Scoring — Purpose: capture/validate scores, aggregate per EventType, official result that advances Bracket. Boundaries: system of record. RingOperations opens/closes window; JudgeAssignment decides who may submit.

JudgeAssignment — Purpose: map judge pool onto rings and RingRoles; push to phones; no-overlap. Last-minute swaps: DirectorDashboard with audit (JudgeAssignment proposes/auto-fills).

Schedule — Purpose: planned timeline; high ranks first. Boundaries: plan only. Live drift via RingOperations / DirectorDashboard.

RingOperations — Purpose: live ring-day execution composing Bracket + Scoring + RingRole. Boundaries: execution and ring state only.

DirectorDashboard — Purpose: active/queued rings, judge bench, overrides. AuditLog only when adjusting a closed ring. Never a silent second scoring path.

Teams (stub) — Placeholder until product locks size, substitution, unit-vs-individual registration.

Ambiguities retained: running-late replanning owner; multi-ring judge-bench contention; which overrides are ring-table vs director-only; teams registration model.


## 4. Operational Flows

# Ring Operations / Flows (from ATA Spec - Ring Ops)

## 1. Registration opens
Single window for the whole event (not staggered by region/school). Online pre-reg + at-door iPad. Registration ties competitor to Division×EventType entries; optional judge flags (willing, center vs corner). **Reg + payment commit atomically** (no limbo). Teams separate stub path.

## 2. Check-in
Scan or iPad lookup. Activates personal live dashboard: compete slots + judge slots. Push + pull. Does not start a ring. No-show policy at ring is open (bye vs forfeit).

## 3. Ring start
Ring = one Division; can run sparring and forms. Call division; need-judge alert to director; director sees active/queued only + non-competing bench. Assignment to RING not device; shared tablet hot-spare. Scorekeeper/timekeeper on tablet; judges on phones where needed.

**Bracket creation wizard (before ring start):** ask if any competitors have championship titles (state/district/world). If none, random bracket + random byes. If yes, select title holders for this event only (ephemeral, not stored); they get byes; leftover byes random. Scorekeeper, judges, or timekeeper may manually reorder while mutable. **Starting the ring locks the bracket.**

## 4. Sparring
Live points/warnings on the locked bracket; undo to match start; no confirm; first-to-cap (trad 5, combat 10); cap auto-stops timer; scorekeeper confirms winner; timekeeper pause/resume; next-pair prompt. Scores mutate in place (no routine event log).

## 5. Forms/weapons
Three judges, digits 1–9; sum after all three; first three set baseline then relative; simultaneous reveal; scorekeeper enters all digits; place ties re-perform; hidden tiebreaker not added to public sum.

## 6. Ring end
Announce + award; ring closes/locks. **AuditLog writes only if someone later adjusts a closed ring** (director reopen + changelog). Routine close itself is mutable-state lock, not an event-sourced read path.

## Ambiguities
No-show/forfeit; creative/extreme identical rules?; who is scorekeeper/timekeeper; need-judge hard-block vs warm-up; time-expire without cap; offline judge phone / tablet fallback.


## 5–8. Scheduling, Non-functionals, Assumptions, Open Questions

## Scheduling + NFR + Assumptions/Open Questions (from ATA Spec - Schedule NFR)

### Scheduling
Schedule generation runs after registration closes (or on director-triggered regenerate) and produces ordered ScheduleSlots per ring and across the day. Default: higher rank tiers earlier so black belts/higher degrees compete in the morning, then judge color-belt divisions after noon. Color-belt/lower-rank queued later by default. Director (and ring staff per Bracket rules) can manually reorder before a ring starts/locks; pre-start reorder mutates state in place (no AuditLog).

JudgeAssignment from Registration judge pool (willing, center vs corner). Pushed to personal phones; pullable from live dashboard. Hard rule: no-overlap (may not judge a ring where still an active competitor). Soft preference: non-competing bench on need-judge alert. TD override audited (who, when, from/to, optional reason).

Moving a compete slot must re-validate no-overlap against judge slots; conflicts surface to director before save.

### Non-functionals
Offline-first: ring tablets and judge phones keep scoring, point entry, timer, next-pair usable without Wi-Fi. Sync on reconnect; in-progress matches: ring tablet is source of truth; locked/reopened conflicts go to director-visible queue.

Big touch targets, minimal taps, faster than paper. No confirm on sparring points; undo to match start. Forms: enter all three digits; sum after all three in. Hot-spare tablets assigned to ring, not device identity.

Performance: common ring actions feel instantaneous offline (plain mutable state; no immutable event-log read path and no sub-second replay NFR). Push within seconds when online; offline pull on dashboard open. Role-gated director reopen of a closed ring; **AuditLog only on adjustments to a closed ring.**

### Assumptions
1. v1 regionals-scoped (5th degree cap), single venue, single calendar day.
2. Bracket creation uses the ring-side championship-title wizard; bracket mutable until ring start, then locked. Paper sheet is UX reference (R/W, P/W, 3rd place), not a fixed-size invariant.
3. Championship titles in the wizard are ephemeral for that event; no titleholder persistence or sync.
4. Registration and payment are atomic; no limbo states.
5. Default persistence is plain mutable state; AuditLog only for closed-ring adjustments.
6. Compete+judge allowed under no-overlap.
7. High-rank-first is default heuristic, overrideable.
8. “After noon” is configurable milestone (default 12:00 local).
9. Creative/extreme same 1–9 baseline-then-relative as traditional unless revised.
10. Teams stub only in v1.
11. Assignment targets ring + roles, not device serial.

### Open questions
1. Tiny Tigers / youth age-band splits.
2. Confirm creative/extreme scoring identical to traditional (baseline, simultaneous reveal, hidden tiebreaker).
3. Multi-day/multi-venue before nationals, or out of v1?
4. Teams depth beyond stub in v1?
5. Push channel (native/SMS/in-app) if judge never opens app.
6. Reg close time: global vs per tournament instance?
7. Two hot-spare tablets both writing same match offline — conflict policy detail.
8. Auto-regenerate schedule on late at-door size changes, or director-only?
9. Center vs corner: hard constraint or preference in auto-assign?
10. Large-print / a11y beyond big targets for v1?


### Additional open questions folded from Ring Ops and Data Model
- Check-in no-show / forfeit at the ring (auto-bye vs staff-marked forfeit).
- Who may act as scorekeeper/timekeeper (dedicated staff vs free judge).
- Need-judge: hard-block until panel complete, or allow warm-up with partial panel.
- Sparring path when time expires without reaching cap.
- Offline judge phone during simultaneous reveal (ring tablet fallback by seat).
- Field size / very large divisions: how the wizard scales when N is large.
- One Registration with many Division lines vs one Registration per Division.
- Ring = Division for whole day vs per ScheduleSlot window.
- Whether Performance is a first-class entity beside Match for forms/weapons.
- Regional 6th+ degree handling at registration.
- Which championship title labels the wizard offers (state / district / world only, or more).

## 9. Helper section status

- ATA Spec - Data Model: received (`data-model-v0.md` + `data-model-architect.md`). Canon uses Architect entity names (Registration, Bracket, Match, ScoreEntry, RingRole, etc.). Paper invariants from v0 folded under Bracket.
- ATA Spec - Modules: received v1+v2 and merged. Dual-role compete+judge = yes under no-overlap.
- ATA Spec - Ring Ops: received and merged into section 4.
- ATA Spec - Schedule NFR: received and merged into sections 5–8.

**Parallel pass complete.** Call decisions applied: bracket creation wizard + ephemeral titles; atomic reg+payment; plain mutable state with AuditLog only on closed-ring adjustments.

## 10. Architect decisions (post-approval)

1. **Registration cardinality:** one Registration with many DivisionEntry lines (atomic pay covers all lines in the commit).
2. **6th+ degree at regional:** block at Registration (reject).
3. **Age bands (M1):** organizer-defined band id + label (Tiny Tigers through 60+ range); exact cut ages deferred.
4. **Gender:** binary split by default; Division may explicitly allow open/co-ed.
5. **Tiny-field rank merge:** not auto-merged in Core Reg M1; tiers exposed as-is until a later merge policy.

