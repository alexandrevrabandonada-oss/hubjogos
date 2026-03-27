# T97: Corredor Livre First Playable Build Sprint — Execution Report

**Status:** EXECUTION TEMPLATE — Fill After Build Sprint  
**Date:** ___ de ___ de 2026  
**Game:** Corredor Livre — Territorial Platformer  
**Phase:** First Playable Build + Validation  
**Predecessor:** T96 Playable Spec (Approved)

---

## Instructions

This is a **post-build report template**. Complete this document after building and testing the first playable version of Corredor Livre.

**Fill sections:** 2-7 with actual data from your build sprint.  
**Do not fill:** Concept, art direction, or planning (already done in T93-T96).

---

## 1. Diagnosis: Why Execution Now

### Pre-Build Assessment (Before You Start)
T93-T96 provided complete specification. This sprint validates:
- Does movement actually feel good?
- Is the game fun in the first 20 seconds?
- Do style-baseline assets work in-engine?
- Can we capture compelling screenshots/GIFs?

### Success Criteria (Measure After Build)
| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Movement feel | "Tight" and satisfying | ___ | ☐ Pass ☐ Fail |
| First 20s fun | No explanation needed | ___ | ☐ Pass ☐ Fail |
| Readability | Platform edges clear | ___ | ☐ Pass ☐ Fail |
| Screenshots | Someone asks "what game?" | ___ | ☐ Pass ☐ Fail |
| Replay desire | "One more run" feeling | ___ | ☐ Pass ☐ Fail |

---

## 2. What Was Actually Built

### 2.1 Build Completion Status

| Room | Planned | Actually Built | % Complete | Notes |
|------|---------|----------------|------------|-------|
| **1. Opening** | Rooftop run | ☐ | ___% | |
| **2. Vertical** | Wall-kick section | ☐ | ___% | |
| **3. Hazard** | Police/tension | ☐ | ___% | |
| **4. Delivery** | Activation | ☐ | ___% | |
| **5. Victory** | Completion | ☐ | ___% | |

**Overall Build:** ___% complete

### 2.2 Assets Actually Implemented

**Character:**
| Element | Planned | Implemented | Quality | Notes |
|---------|---------|-------------|---------|-------|
| Base sprite | 64px side | ☐ | ☐ Rough ☐ Final | |
| Idle animation | 4 frames | ☐ | ☐ Rough ☐ Final | |
| Run animation | 6-8 frames | ☐ | ☐ Rough ☐ Final | |
| Jump animation | 4 frames | ☐ | ☐ Rough ☐ Final | |
| Wall-kick | 3 frames | ☐ | ☐ Rough ☐ Final | |
| Land | 2 frames | ☐ | ☐ Rough ☐ Final | |
| Interact | 3 frames | ☐ | ☐ Rough ☐ Final | |

**Tiles:**
| Tile | Planned | Implemented | Quality |
|------|---------|-------------|---------|
| Laje (concrete) | 2 variants | ☐ | ☐ Blockout ☐ Style |
| Telha (tile) | 2 variants | ☐ | ☐ Blockout ☐ Style |
| Escada (stair) | 1 variant | ☐ | ☐ Blockout ☐ Style |
| Ledge | 1 variant | ☐ | ☐ Blockout ☐ Style |
| Hazard | 1 variant | ☐ | ☐ Blockout ☐ Style |

**Props:**
| Prop | Planned | Implemented | Quality |
|------|---------|-------------|---------|
| Caixa d'água | 1 | ☐ | ☐ Blockout ☐ Style |
| Varal | Background | ☐ | ☐ Blockout ☐ Style |
| Poste | 1 | ☐ | ☐ Blockout ☐ Style |
| Police line | 1 | ☐ | ☐ Blockout ☐ Style |

**Background:**
| Layer | Planned | Implemented | Quality |
|-------|---------|-------------|---------|
| Sky | Gradient | ☐ | ☐ Blockout ☐ Style |
| Far city | Silhouette | ☐ | ☐ Blockout ☐ Style |
| Mid hill | Houses | ☐ | ☐ Blockout ☐ Style |
| Near | Wires | ☐ | ☐ Blockout ☐ Style |

### 2.3 Build Scope Changes

**What was CUT from T96 spec:**
```
[List anything removed to meet timeline]
```

**What was ADDED beyond T96 spec:**
```
[List anything new discovered during build]
```

---

## 3. Movement Tuning Log

### 3.1 Target vs Actual Values

| Parameter | T96 Target | Actual Value | Change | Feel Result |
|-----------|------------|--------------|--------|-------------|
| **Run max speed** | 8 u/s | ___ | ☐ Higher ☐ Lower ☐ Same | |
| **Acceleration** | 0.5s to max | ___ | ☐ Faster ☐ Slower ☐ Same | |
| **Friction** | Quick stop | ___ | ☐ More ☐ Less ☐ Same | |
| **Jump height** | 2.5 tiles | ___ | ☐ Higher ☐ Lower ☐ Same | |
| **Jump duration** | 0.6s | ___ | ☐ Longer ☐ Shorter ☐ Same | |
| **Gravity normal** | 1.0x | ___ | ☐ Heavier ☐ Lighter ☐ Same | |
| **Coyote time** | 100ms | ___ | ☐ More ☐ Less ☐ Same | |
| **Jump buffer** | 100ms | ___ | ☐ More ☐ Less ☐ Same | |
| **Wall-kick angle** | 45° | ___ | ☐ Steeper ☐ Shallower ☐ Same | |
| **Wall-kick force** | Strong | ___ | ☐ Stronger ☐ Weaker ☐ Same | |

### 3.2 Tuning Iterations Log

Record each significant tuning change and its effect:

**Iteration 1:**
- Date: ___
- Change: ___
- Result: ___
- Keeper? ☐ Yes ☐ No → Reverted to ___

**Iteration 2:**
- Date: ___
- Change: ___
- Result: ___
- Keeper? ☐ Yes ☐ No → Reverted to ___

**Iteration 3:**
- Date: ___
- Change: ___
- Result: ___
- Keeper? ☐ Yes ☐ No → Reverted to ___

[Add more as needed]

### 3.3 Final Movement Values

**Document final tuned values:**
```
Run Speed: ___ units/sec
Acceleration: ___ units/sec²
Friction: ___

Jump:
  Max Height: ___ tiles
  Rise Time: ___ seconds
  Fall Time: ___ seconds
  Gravity Scale: ___

Wall-kick:
  Launch Force: ___
  Launch Angle: ___ degrees
  Contact Window: ___ ms

Coyote Time: ___ ms
Jump Buffer: ___ ms
```

---

## 4. Feel Assessment

### 4.1 Movement Feel Checklist

| Aspect | Assessment | Score (1-10) | Notes |
|--------|------------|--------------|-------|
| **Running pleasure** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Jump satisfaction** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Wall-kick fun** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Landing feel** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Control precision** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Input responsiveness** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |
| **Restart speed** | ☐ Great ☐ Good ☐ OK ☐ Weak | ___ | |

### 4.2 First 20 Seconds Assessment

**Test:** New player sits down, no explanation given.

| Observation | Result | Notes |
|-------------|--------|-------|
| Player starts moving within 5s | ☐ Yes ☐ No | |
| Player understands jump quickly | ☐ Yes ☐ No | |
| Player attempts wall-kick | ☐ Yes ☐ No | |
| Player smiles/laughs/engages | ☐ Yes ☐ No | |
| Player asks to play again | ☐ Yes ☐ No | |

**Quote from playtester (if any):**
```

```

### 4.3 Replay Desire Assessment

**Internal test:** Played 10+ times in one session.

| Aspect | Assessment |
|--------|------------|
| Want to beat time | ☐ Yes ☐ No |
| Want to perfect jumps | ☐ Yes ☐ No |
| Want to try alternate routes | ☐ Yes ☐ No |
| Enjoy movement even when failing | ☐ Yes ☐ No |
| Satisfied by completion | ☐ Yes ☐ No |

**Overall replay desire:** ☐ High ☐ Medium ☐ Low

### 4.4 Feel Issues Log

| Issue | Severity | Repro Steps | Fix Applied? |
|-------|----------|-------------|--------------|
| | ☐ High ☐ Medium ☐ Low | | ☐ Yes ☐ No |
| | ☐ High ☐ Medium ☐ Low | | ☐ Yes ☐ No |
| | ☐ High ☐ Medium ☐ Low | | ☐ Yes ☐ No |

---

## 5. Readability Review

### 5.1 Platform Edge Clarity

| Platform Type | Edge Visible? | Score (1-10) | Notes |
|---------------|---------------|--------------|-------|
| Laje | ☐ Yes ☐ No | ___ | |
| Telha | ☐ Yes ☐ No | ___ | |
| Escada | ☐ Yes ☐ No | ___ | |
| Ledge | ☐ Yes ☐ No | ___ | |

**Verdict:** ☐ Clear ☐ Needs work

**Required fixes:**
```

```

### 5.2 Hazard Clarity

| Hazard | Visible in Motion? | Score (1-10) | Notes |
|--------|-------------------|--------------|-------|
| Police line | ☐ Yes ☐ No | ___ | |
| Gap/void | ☐ Yes ☐ No | ___ | |
| Cerca/barrier | ☐ Yes ☐ No | ___ | |
| Wet surface (if present) | ☐ Yes ☐ No | ___ | |

**Verdict:** ☐ Clear ☐ Needs work

**Required fixes:**
```

```

### 5.3 Character Contrast

**Test:** Character visible against all backgrounds during play?

| Background | Contrast Score (1-10) | Issue? |
|------------|----------------------|--------|
| Sky | ___ | ☐ None ☐ Minor ☐ Major |
| Laje | ___ | ☐ None ☐ Minor ☐ Major |
| Telha | ___ | ☐ None ☐ Minor ☐ Major |
| Shadow | ___ | ☐ None ☐ Minor ☐ Major |

**Mobile test (48px):** ☐ Readable ☐ Too small ☐ Unclear

**Required fixes:**
```

```

### 5.4 Camera Readability

| Aspect | Assessment | Score (1-10) |
|--------|------------|--------------|
| Player always visible | ☐ Yes ☐ No | ___ |
| Jump destination visible | ☐ Yes ☐ No | ___ |
| Hazard visible in advance | ☐ Yes ☐ No | ___ |
| Parallax not distracting | ☐ Yes ☐ No | ___ |
| Screen shake appropriate | ☐ Yes ☐ No | ___ |

**Verdict:** ☐ Good ☐ Needs tuning

### 5.5 Readability Issues Log

| Issue | Location | Severity | Fix Applied? |
|-------|----------|----------|--------------|
| | | ☐ High ☐ Medium ☐ Low | ☐ Yes ☐ No |
| | | ☐ High ☐ Medium ☐ Low | ☐ Yes ☐ No |

---

## 6. Screenshot/GIF Capture Review

### 6.1 Capture Execution

| Target | Captured? | Quality | Use Ready? | File |
|--------|-----------|---------|------------|------|
| **Opening run** | ☐ Yes ☐ No | ☐ Great ☐ Good ☐ OK ☐ Poor | ☐ Yes ☐ No | ___ |
| **Mid-jump** | ☐ Yes ☐ No | ☐ Great ☐ Good ☐ OK ☐ Poor | ☐ Yes ☐ No | ___ |
| **Wall-kick** | ☐ Yes ☐ No | ☐ Great ☐ Good ☐ OK ☐ Poor | ☐ Yes ☐ No | ___ |
| **Hazard escape** | ☐ Yes ☐ No | ☐ Great ☐ Good ☐ OK ☐ Poor | ☐ Yes ☐ No | ___ |
| **Victory** | ☐ Yes ☐ No | ☐ Great ☐ Good ☐ OK ☐ Poor | ☐ Yes ☐ No | ___ |

### 6.2 GIF Quality Assessment

| GIF | Duration | Size | Loop Quality | Shareable? |
|-----|----------|------|--------------|------------|
| Run cycle | ___ | ___ | ☐ Great ☐ Good ☐ OK | ☐ Yes ☐ No |
| Wall-kick | ___ | ___ | ☐ Great ☐ Good ☐ OK | ☐ Yes ☐ No |
| Jump arc | ___ | ___ | ☐ Great ☐ Good ☐ OK | ☐ Yes ☐ No |
| Victory | ___ | ___ | ☐ Great ☐ Good ☐ OK | ☐ Yes ☐ No |

### 6.3 Screenshot Quality Bar

| Criteria | Pass? |
|----------|-------|
| Someone asks "what game?" | ☐ Yes ☐ No |
| Readable at thumbnail | ☐ Yes ☐ No |
| Color palette distinctive | ☐ Yes ☐ No |
| Action clear without text | ☐ Yes ☐ No |
| Feels like a real game | ☐ Yes ☐ No |

**Best shot:** ___ (which one)

**Worst shot:** ___ (which one)

**Required reshoots:**
```

```

### 6.4 Capture Issues Log

| Issue | Shot Affected | Resolution |
|-------|---------------|------------|
| | | |
| | | |

---

## 7. Lane Verdict

### 7.1 Decision Matrix

Score each factor (1-10), then total:

| Factor | Weight | Score | Weighted | Notes |
|--------|--------|-------|----------|-------|
| Running pleasure | 3x | ___ | ___ | |
| Jump readability | 3x | ___ | ___ | |
| Wall-kick fun | 2x | ___ | ___ | |
| Silhouette clarity | 2x | ___ | ___ | |
| Atmosphere | 2x | ___ | ___ | |
| First 20s fun | 3x | ___ | ___ | |
| Screenshot power | 2x | ___ | ___ | |
| Replay desire | 2x | ___ | ___ | |
| **Total** | | | **___/190** | |

### 7.2 Verdict Thresholds

| Score Range | Verdict | Action |
|-------------|---------|--------|
| 160-190 | HIGH-POTENTIAL FLAGSHIP | Full production greenlight |
| 110-159 | PROMISING BUT NEEDS TUNING | Iterate movement, keep art |
| 0-109 | VISUALLY GOOD / FEEL WEAK | Pivot or cut scope |

### 7.3 Final Verdict

**SELECT ONLY ONE:**

☐ **HIGH-POTENTIAL FLAGSHIP LANE**
- Movement feels great
- Screenshots strong
- Atmosphere clear
- Production greenlight

☐ **PROMISING BUT NEEDS MOVEMENT TUNING**
- Core is good
- Feel needs iteration
- Art direction strong
- Continue with adjustments

☐ **VISUALLY STRONG BUT FEEL WEAK**
- Looks good
- Plays poorly
- Needs significant rework
- Consider pivot

### 7.4 Verdict Rationale

**One paragraph explaining the decision:**
```

```

**Key evidence:**
```
- Best aspect: 
- Worst aspect: 
- Surprising finding: 
```

### 7.5 Next Actions

**If HIGH-POTENTIAL:**
- [ ] Full production plan
- [ ] Expand to 8-room slice
- [ ] Advanced animations
- [ ] Audio integration

**If NEEDS TUNING:**
- [ ] Specific tuning tasks: ___
- [ ] Retest timeline: ___
- [ ] Success criteria: ___

**If FEEL WEAK:**
- [ ] Pivot options: ___
- [ ] Art salvage: ___
- [ ] New direction: ___

---

## 8. Verification Summary

### 8.1 Build Verification

| Requirement | Met? | Evidence |
|-------------|--------|----------|
| 5 rooms built | ☐ Yes ☐ No | ___% complete |
| 7 animations | ☐ Yes ☐ No | ___ implemented |
| Style assets | ☐ Yes ☐ No | ___% quality |
| Movement tuned | ☐ Yes ☐ No | Values documented |
| Screenshots | ☐ Yes ☐ No | ___ captured |

### 8.2 Quality Gates

| Gate | Status | Notes |
|------|--------|-------|
| Movement feel | ☐ Pass ☐ Fail | |
| Readability | ☐ Pass ☐ Fail | |
| Screenshots | ☐ Pass ☐ Fail | |
| First 20s | ☐ Pass ☐ Fail | |

### 8.3 Confidence Assessment

**Movement:** ☐ High ☐ Medium ☐ Low  
**Visuals:** ☐ High ☐ Medium ☐ Low  
**Readability:** ☐ High ☐ Medium ☐ Low  
**Lane Viability:** ☐ High ☐ Medium ☐ Low

---

## 9. Sprint Retrospective

### 9.1 What Went Well
```

```

### 9.2 What Went Poorly
```

```

### 9.3 Surprises
```

```

### 9.4 Lessons for Next Sprint
```

```

---

## Sign-off

**Build Lead:** _______________  
**Art Lead:** _______________  
**Date Completed:** _______________  
**Next Review:** _______________

---

**T97 — Corredor Livre First Playable Build Sprint**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Predecessor: T96 Playable Spec**  
**Successor: T98 Full Production OR Pivot**  
**Status: COMPLETE TEMPLATE — Fill After Build**
