# T98: Corredor Livre Movement Spike + Early Kill/Continue Gate

**Status:** SPIKE SPEC — Build Fast, Decide Fast  
**Date:** 27 de Março de 2026  
**Game:** Corredor Livre — Territorial Platformer  
**Phase:** Movement Spike / Early Gate  
**Duration:** 3-5 Days Maximum  
**Predecessor:** T96-T97 Playable Specs

---

## 1. Diagnosis: Why Spike Now

### The Problem
T93-T97 provided complete planning. But planning doesn't prove fun. Waiting 6 weeks to discover the platformer doesn't feel good is too slow and expensive.

### The Solution
Build a **1-minute movement spike** in 3-5 days. Test core feel immediately. Decide: continue, rework, or kill.

### Success Criteria (Test After Spike)
| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Running feels good | Immediate speed pleasure | ___ | ☐ Pass ☐ Fail |
| Jumping feels precise | Readable, controllable | ___ | ☐ Pass ☐ Fail |
| Wall-kick adds fun | Not frustration | ___ | ☐ Pass ☐ Fail |
| Route readable | No confusion | ___ | ☐ Pass ☐ Fail |
| Replay desire | "One more try" | ___ | ☐ Pass ☐ Fail |

---

## 2. Files to Create/Change

### New Spike Files
| File | Purpose |
|------|---------|
| `reports/t98-corredor-livre-movement-spike-gate.md` | This document |
| `games/corredor-livre/spike/scope.md` | Tiny spike scope |
| `games/corredor-livre/spike/movement-spec.md` | Feel targets |
| `games/corredor-livre/spike/test-protocol.md` | First-20s test |
| `games/corredor-livre/spike/verdict.md` | Kill/continue decision |

---

## 3. Spike Scope: 1-Minute Maximum

### 3.1 What to Build (Tiny)

**One Continuous Sequence:**

| Segment | Duration | Elements | Purpose |
|---------|----------|----------|---------|
| **A. Opening Run** | 15s | Flat run, 2 small jumps | Feel speed |
| **B. Vertical Kick** | 20s | Wall, 2 wall-kicks to climb | Test signature move |
| **C. Hazard Pass** | 15s | One obstacle to avoid | Risk/reward |
| **D. Delivery** | 10s | Reach goal, completion | Emotional payoff |

**Total:** ~60 seconds first-run, ~30 seconds speedrun

### 3.2 Movement Set (Minimum)

**Required (Build These):**
1. **Run** — Acceleration, max speed, friction
2. **Jump** — Variable height, arc, landing
3. **Wall-kick** — Contact, push-off, angle
4. **Land** — Impact feel, recovery

**Optional (Add Only If Stable):**
5. Interact — For delivery beat

**Cut:**
- Slide
- Climb (use wall-kick instead)
- Dash

### 3.3 Style-Baseline Assets (Minimum)

**Character:**
- [ ] Side-view sprite (64px)
- [ ] 4 rough animations: idle, run, jump, wall-kick
- [ ] Color: Orange hoodie, dark pants

**Tiles:**
- [ ] Laje (flat platform)
- [ ] Wall (vertical surface)
- [ ] Ledge (wall-kick zone)
- [ ] Hazard (barrier)

**Background:**
- [ ] Sky gradient (late afternoon)
- [ ] Far city (silhouette)
- [ ] One parallax layer (houses)

**Props:**
- [ ] One vertical marker (caixa d'água or poste)
- [ ] One background element (varal or fios)

### 3.4 What's NOT in Spike

**Explicitly Cut:**
- ❌ Multiple rooms (just one sequence)
- ❌ Full 5-room scope
- ❌ Complex hazards (just one simple obstacle)
- ❌ Advanced moves (slide, climb, dash)
- ❌ Full animation set (4 rough anims only)
- ❌ Full tile kit (4 tiles only)
- ❌ Full prop set (2 props only)
- ❌ Multiple backgrounds (sky + city + one layer)
- ❌ Audio
- ❌ Save system
- ❌ UI polish

**Rationale:** Test movement feel first. Everything else is secondary.

---

## 4. Implementation

### 4.1 Day-by-Day Plan

**Day 1: Setup + Run**
- [ ] Character sprite (rough)
- [ ] Idle + run animation (rough)
- [ ] Run movement code
- [ ] Test: Does running feel good?

**Day 2: Jump + Wall-Kick**
- [ ] Jump animation (rough)
- [ ] Jump movement code
- [ ] Wall detection
- [ ] Wall-kick code + animation
- [ ] Test: Does wall-kick work?

**Day 3: Level + Polish**
- [ ] Build 4 segments (A-D)
- [ ] Add backgrounds
- [ ] Add one hazard
- [ ] Add completion trigger
- [ ] Playtest loop

**Day 4: Test + Document**
- [ ] First-20-seconds test
- [ ] Movement tuning
- [ ] Screenshot capture
- [ ] Fill T98 report

**Day 5: Decision**
- [ ] Kill/continue verdict
- [ ] Next steps plan
- [ ] Handoff

### 4.2 Movement Targets (Start Here)

**Running:**
```
Max Speed: 10 units/sec (faster than final target)
Acceleration: 0.3 sec to max (snappy)
Friction: 0.2 sec to stop (tight)
Turn: Instant (responsive)
```

**Jumping:**
```
Max Height: 3 tiles (generous for spike)
Rise Time: 0.4 sec (quick)
Fall Time: 0.5 sec (weight)
Variable: Hold button = +20% height
Coyote Time: 120 ms (forgiving)
Buffer: 120 ms (responsive)
```

**Wall-Kick:**
```
Contact Sticky: 150 ms window
Push Force: Strong diagonal
Angle: 45 degrees up and away
Air Control: Reduced during kick arc
```

**Tune From Here:** Adjust up/down based on feel.

### 4.3 Segment Details

**A. Opening Run (15 seconds)**
```
Layout: 8-screen flat run
Jumps: 2 small gaps (2 tiles each)
Goal: Build speed, feel momentum
Win: Player smiles at speed
```

**B. Vertical Kick (20 seconds)**
```
Layout: 4-screen vertical section
Wall-kicks: 2 required to reach top
Fall: Safe (reset to start of segment)
Goal: Signature move feels good
Win: Wall-kick is satisfying, not frustrating
```

**C. Hazard Pass (15 seconds)**
```
Layout: 3-screen run with one obstacle
Hazard: Low barrier (jump or avoid)
Penalty: Slow down or miss = restart segment
Goal: Risk creates tension
Win: Hazard readable, avoidable
```

**D. Delivery (10 seconds)**
```
Layout: 2-screen final run
Goal: Reach end, trigger completion
Feedback: Light flash, "Complete" text
Win: Feels like accomplishment
```

---

## 5. First-20-Seconds Test Protocol

### 5.1 Test Setup

**Tester:** Someone who hasn't seen the game  
**Instructions:** "Play this. Tell me what you think."  
**No hints, no tutorial, no explanation**

### 5.2 Observation Checklist

**First 5 Seconds:**
- [ ] Player starts moving within 3 seconds
- [ ] No confusion about controls
- [ ] Immediate visual engagement

**First 10 Seconds:**
- [ ] Player attempts a jump
- [ ] Jump arc is readable
- [ ] No frustration visible

**First 20 Seconds:**
- [ ] Player attempts wall-kick OR reaches hazard
- [ ] Route is readable (not lost)
- [ ] Some expression of engagement (smile, focus, verbal)

**After First Completion:**
- [ ] Player wants to play again
- [ ] Player mentions speed or movement unprompted
- [ ] No complaints about feel

### 5.3 Success Criteria

| Test | Pass Threshold | Result |
|------|----------------|--------|
| Starts moving | 3/3 testers within 3s | ☐ Pass ☐ Fail |
| Attempts jump | 3/3 testers within 10s | ☐ Pass ☐ Fail |
| Attempts wall-kick | 2/3 testers within 20s | ☐ Pass ☐ Fail |
| Wants replay | 2/3 testers immediately | ☐ Pass ☐ Fail |
| No feel complaints | 0/3 testers complain | ☐ Pass ☐ Fail |

**Verdict:** ☐ PASS (continue) ☐ CONDITIONAL (rework) ☐ FAIL (kill)

---

## 6. Feel Review

### 6.1 Movement Feel Checklist

| Aspect | Target | Score (1-10) | Pass? |
|--------|--------|--------------|-------|
| **Running speed** | Fast, satisfying | ___ | ☐ ≥7 |
| **Running control** | Tight, responsive | ___ | ☐ ≥7 |
| **Jump height** | Reachable, challenging | ___ | ☐ ≥6 |
| **Jump control** | Variable, precise | ___ | ☐ ≥6 |
| **Wall-kick feel** | Satisfying launch | ___ | ☐ ≥6 |
| **Wall-kick reliability** | Consistent | ___ | ☐ ≥6 |
| **Landing feel** | Crisp, not floaty | ___ | ☐ ≥6 |
| **Restart speed** | Fast, low friction | ___ | ☐ ≥7 |

**Average Score:** ___/80

**Verdict:** ☐ Strong (≥56) ☐ Adequate (40-55) ☐ Weak (<40)

### 6.2 Feel Issues Log

| Issue | Severity | Repro | Fix Time | Decision |
|-------|----------|-------|----------|----------|
| | ☐ High ☐ Med ☐ Low | | ___ hours | ☐ Fix ☐ Accept ☐ Kill |
| | ☐ High ☐ Med ☐ Low | | ___ hours | ☐ Fix ☐ Accept ☐ Kill |

### 6.3 Replay Desire Assessment

**Internal Test (Developer playing 20+ times):**

| Aspect | Result |
|--------|--------|
| Enjoy movement even failing | ☐ Yes ☐ No |
| Want to beat own time | ☐ Yes ☐ No |
| Want to perfect wall-kicks | ☐ Yes ☐ No |
| Satisfied by completion | ☐ Yes ☐ No |
| Would play full version | ☐ Yes ☐ No |

**Verdict:** ☐ High desire ☐ Medium ☐ Low

---

## 7. Readability Findings

### 7.1 Platform Clarity

| Element | Clear? | Notes |
|---------|--------|-------|
| Platform edges | ☐ Yes ☐ No | |
| Wall-kick zones | ☐ Yes ☐ No | |
| Hazard visibility | ☐ Yes ☐ No | |
| Goal visibility | ☐ Yes ☐ No | |

### 7.2 Character Contrast

| Background | Visible? | Notes |
|------------|----------|-------|
| Sky | ☐ Yes ☐ No | |
| Laje | ☐ Yes ☐ No | |
| Wall | ☐ Yes ☐ No | |

### 7.3 Readability Issues

| Issue | Severity | Quick Fix? |
|-------|----------|------------|
| | ☐ High ☐ Med ☐ Low | ☐ Yes ☐ No |
| | ☐ High ☐ Med ☐ Low | ☐ Yes ☐ No |

---

## 8. Kill/Continue Decision

### 8.1 Decision Framework

**Score the spike (1-10 each):**

| Factor | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Running feel | ___ | 3x | ___ |
| Jump feel | ___ | 3x | ___ |
| Wall-kick feel | ___ | 3x | ___ |
| First 20s fun | ___ | 3x | ___ |
| Replay desire | ___ | 2x | ___ |
| Readability | ___ | 2x | ___ |
| Visual identity | ___ | 1x | ___ |
| **Total** | | | **___/170** |

### 8.2 Verdict Options

**SELECT ONLY ONE:**

☐ **CONTINUE TO FULL SPRINT**
- Score: 130-170
- Movement feels great
- Wall-kick is fun
- Ready for T96/T97 full build

☐ **CONTINUE WITH MOVEMENT REWORK**
- Score: 90-129
- Core is promising
- Needs tuning (specify below)
- 2-3 day rework, then retest

☐ **KILL / PAUSE PLATFORMER LANE**
- Score: 0-89
- Movement doesn't feel good
- Wall-kick is frustrating
- Art/assets salvageable for other use
- Pivot to different lane

### 8.3 Verdict Rationale

**Selected Verdict:** ___

**One paragraph explaining why:**
```

```

**Key evidence:**
```
Best: 
Worst: 
Surprise: 
```

### 8.4 Next Actions by Verdict

**If CONTINUE TO FULL SPRINT:**
- [ ] Launch T96/T97 full build sprint
- [ ] Expand team if needed
- [ ] 6-week timeline to first playable

**If CONTINUE WITH REWORK:**
- [ ] Specific rework needed: ___
- [ ] Timeline: ___ days
- [ ] Retest date: ___
- [ ] Success criteria: ___

**If KILL / PAUSE:**
- [ ] Art asset disposition: ___
- [ ] Team reassignment: ___
- [ ] New lane consideration: ___
- [ ] Documentation archive: ___

---

## 9. Verification Summary

### 9.1 Spike Completion

| Requirement | Met? | Evidence |
|-------------|--------|----------|
| 1-minute sequence built | ☐ Yes ☐ No | ___ sec actual |
| 4 movements implemented | ☐ Yes ☐ No | ___ working |
| Style assets in place | ☐ Yes ☐ No | ___% rough |
| First-20s test done | ☐ Yes ☐ No | ___ testers |
| Verdict reached | ☐ Yes ☐ No | ___ selected |

### 9.2 Quality Gates

| Gate | Status |
|------|--------|
| Movement feel | ☐ Pass ☐ Fail |
| Wall-kick fun | ☐ Pass ☐ Fail |
| Readability | ☐ Pass ☐ Fail |
| Replay desire | ☐ Pass ☐ Fail |

### 9.3 Spike Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Days spent | 3-5 | ___ |
| Playable minutes | 1 | ___ |
| Testers | 3 | ___ |
| Tuning iterations | 5-10 | ___ |

---

## Sign-off

**Spike Lead:** _______________  
**Date Started:** _______________  
**Date Completed:** _______________  
**Verdict Date:** _______________

---

**T98 — Corredor Livre Movement Spike + Early Kill/Continue Gate**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Philosophy: Build Fast, Decide Fast, Don't Wait**  
**Max Duration: 5 Days**  
**Date: 27 de Março de 2026**
