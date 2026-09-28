# ATA Tournament App — Interactive Mid-fi Prototype v1

**Identity:** Ring Day dark only (tokens from `package-v1/tokens.json`)  
**Gate:** D approved  
**Date:** 2026-09-27 (PT)

## Open locally

```bash
# Option A — open file directly (works; CSS is inlined)
open /workspace/ata-design/prototype-v1/index.html
# or double-click index.html / open in phone browser via file share

# Option B — local static server (preferred for phone on same network)
cd /workspace/ata-design/prototype-v1
python3 -m http.server 8765
# then visit http://localhost:8765/ or http://<your-lan-ip>:8765/ on phone
```

Phone-wrap fills `100dvh` on mobile and caps at `max-width: 430px` centered on desktop.

## Hub

`index.html` — three equal entry buttons:

1. **Registration flow** → R1  
2. **Director flow** → D1  
3. **Judge scoring** → J1  

## Wired transitions

### Registration
| From | Action | To |
|------|--------|-----|
| Hub | Registration flow | R1 |
| R1 | Start registration | R2 |
| R2 | Continue / ← Back | R3 / R1 |
| R3 | Continue / ← Back | R4 / R2 |
| R4 | Continue / ← Back | R5 / R3 |
| R5 | Pay & register / ← Back | R6 / R4 |
| R6 | Done / Add to dashboard | Hub |

Checks + radios toggle on R3–R5.

### Director
| From | Action | To |
|------|--------|-----|
| Hub | Director flow | D1 |
| D1 | Ring 2 row or Need judge alert | D2 |
| D1 | Ring 3 (LIVE) | D4 reopen |
| D2 | Assign (Alex/Sam) | D3 |
| D2 | Dismiss / ← Back | D1 |
| D3 | Confirm assign / ← Back | D1 / D2 |
| D4 | Reopen or Cancel / ← Back | D1 |

### Judge (J1 → J3)
| From | Action | To |
|------|--------|-----|
| Hub | Judge scoring | J1 |
| J1 | Open panel · Forms score | J2 |
| J1 | I'm here / Open panel · Sparring | J3 |
| J2 | Digit 1–9 | selected state on pad |
| J2 | Submit score | stays on J2 · “held for reveal” feedback |
| J2 | ← Back / Sparring presence | J1 / J3 |
| J3 | ← Back / Forms scoring / Hub | J1 / J2 / Hub |

## Non-essential chrome

Schedule / Me / Alerts tabs are visual only (`pointer-events: none`). Each screen has a small **Hub** chip (top-right) to return to `index.html`.

## Do not

- This is static HTML/JS mid-fi only — not a production React scaffold.
- Do not overwrite `wireframes-lofi-v0.md` or mutate `package-v1/tokens.json` as source of truth (token hex values are copied/inlined here).
