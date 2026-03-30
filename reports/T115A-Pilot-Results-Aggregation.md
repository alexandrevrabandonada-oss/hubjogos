# T115A Pilot Results & Analysis (Instructions for Aggregator)

**Test Wave:** T115A Pilot  
**Analysis Date:** [INSERT DATE]  
**Total Sessions:** [____] / 12 target  
**Analysis By:** [INSERT NAME]  

---

## Data Entry Instructions

After collecting all pilot session metrics sheets, fill in this template:

### Step 1: Tester Mix Summary

From your collection sheets, count:

| Category | Target | Actual | % |
|----------|--------|--------|---|
| Mobile-first players | 4 | __ | __% |
| Desktop-first players | 4 | __ | __% |
| Casual players (low context) | 3 | __ | __% |
| **Total** | **12** | **__** | **__%** |

**Device breakdown:**
- iPhone: __ (iOS versions: ____________)
- Samsung/Android: __ (Android versions: ____________)
- MacBook: __ (macOS versions: ____________)
- Windows PC: __ (Windows versions: ____________)

**Browsers tested:**
- Safari: __
- Chrome: __
- Firefox: __
- Other: __

---

## Step 2: Four Early Signal Metrics

### Metric 1: Retry Rate (% Yes + Maybe)

**From collection sheets, count:**
- Retry desire = "Yes": __
- Retry desire = "Maybe": __
- Retry desire = "No": __

**Calculation:**
```
Retry Rate = (Yes + Maybe) / Total × 100
Retry Rate = (__ + __) / __ × 100 = ____%

Target: >70%
PASS? [ ] Yes [ ] No
```

### Metric 2: Fun Factor (Average 1–10)

**From collection sheets, list Q1 scores:**
- P01: __/10
- P02: __/10
- P03: __/10
- P04: __/10
- P05: __/10
- P06: __/10
- P07: __/10
- P08: __/10
- P09: __/10 (if applicable)
- P10: __/10 (if applicable)
- P11: __/10 (if applicable)
- P12: __/10 (if applicable)

**Calculation:**
```
Average Fun Score = (__ + __ + __ + __ + __ + __ + __ + __) / __ = __._ / 10

Target: ≥7.0
PASS? [ ] Yes [ ] No
```

### Metric 3: Aiming Confidence (Average 1–5)

**From collection sheets, list Q3 scores:**
- P01: __/5
- P02: __/5
- P03: __/5
- P04: __/5
- P05: __/5
- P06: __/5
- P07: __/5
- P08: __/5
- P09: __/5 (if applicable)
- P10: __/5 (if applicable)
- P11: __/5 (if applicable)
- P12: __/5 (if applicable)

**Calculation:**
```
Average Aiming Confidence = (__ + __ + __ + __ + __ + __ + __ + __) / __ = __._ / 5

Target: ≥4.0
PASS? [ ] Yes [ ] No
```

### Metric 4: Would Share (% Yes + Maybe)

**From collection sheets, count:**
- Share = "Yes": __
- Share = "Maybe": __
- Share = "No": __

**Calculation:**
```
Share Rate = (Yes + Maybe) / Total × 100
Share Rate = (__ + __) / __ × 100 = ____%

Target: >50%
PASS? [ ] Yes [ ] No
```

---

## Step 3: Blocker Flags Summary

**From all collection sheets, count blocker flags:**

| Blocker | Count | 3+ Flagged? | Action |
|---------|-------|-------------|--------|
| Confusing aiming | __ | [ ] Yes [ ] No | Iterate trajectory? |
| Weak impact feeling | __ | [ ] Yes [ ] No | Iterate audio/visuals? |
| Audio annoyance | __ | [ ] Yes [ ] No | Tune audio levels? |
| Mobile discomfort | __ | [ ] Yes [ ] No | Adjust touch targets? |
| Fast boredom | __ | [ ] Yes [ ] No | Too short / lack replay? |
| Haptic confusion | __ | [ ] Yes [ ] No | Improve haptic clarity? |
| Device issue (crash/lag) | __ | [ ] Yes [ ] No | Fix device support? |

**RED FLAG THRESHOLD:** If any blocker is flagged by 3+ players, consider iterating T114.

**Blockers at threshold:** ___________________________

---

## Step 4: Audio & Haptic Feedback Analysis

### Audio Quality
**From Q5 scores (1–5 scale):**
```
Average Audio Satisfaction = __._ / 5

Breakdown:
- 5 (excellent): __ players
- 4 (good): __ players
- 3 (ok): __ players
- 2 (poor): __ players
- 1 (bad): __ players

Sound most noticed:
- Launch whoosh: __ / __ heard it
- Impact crunch: __ / __ heard it
- Cascade rattle: __ / __ heard it
- Restoration chime: __ / __ heard it
```

**Audio perception:** ___________________________

### Haptic Feedback (Mobile Sessions Only)
```
Mobile sessions total: __

Haptic perception:
- Felt fire tap: __ / mobile
- Felt impact cascade: __ / mobile
- Felt victory pulse: __ / mobile
- Didn't notice haptic: __ / mobile

Haptic satisfaction:
- Loved haptics: __ / mobile
- Haptics OK: __ / mobile
- Wanted haptics off: __ / mobile
```

**Haptic perception:** ___________________________

---

## Step 5: Device Compatibility

### Device Success Rates

| Platform | Sessions | Issues | Success Rate | Notes |
|----------|----------|--------|--------------|-------|
| iOS / iPhone | __ | __ | __% | _____________ |
| Android / Mobile | __ | __ | __% | _____________ |
| Desktop (Mac/Windows) | __ | __ | __% | _____________ |

**Critical device issues (if any):** ___________________________

---

## Step 6: Top Feedback Themes

**Go through all open feedback and note patterns:**

### Most Common Positive Reactions
(What did 3+ players say they liked?)

1. ___________________________
2. ___________________________
3. ___________________________

### Most Common Friction Points
(What did 3+ players struggle with?)

1. ___________________________
2. ___________________________
3. ___________________________

### Most Requested Changes
(What would 3+ players want added/changed?)

1. ___________________________
2. ___________________________
3. ___________________________

---

## Step 7: Gate Evaluation

### Gate 1: Toy Factor Survival
**Required:** 2–3 criteria pass

| Criterion | Metric | Result | Pass? |
|-----------|--------|--------|-------|
| Retry rate ≥70% | ___% | [ ] ✓ [ ] ✗ |
| Fun factor ≥7.0 avg | __._ | [ ] ✓ [ ] ✗ |
| Would share ≥50% | ___% | [ ] ✓ [ ] ✗ |

**Gate 1 Result:** [ ] PASS (2–3 criteria met) [ ] FAIL (0–1 criteria met)

---

### Gate 2: No Critical Friction
**Required:** All 3 criteria pass

| Criterion | Result | Pass? |
|-----------|--------|-------|
| <3 players flag same blocker | [ ] ✓ [ ] ✗ |
| Aiming confidence ≥4.0 avg | __._ / 5 [ ] ✓ [ ] ✗ |
| No "unusable on [device]" complaints | Blockers: __ [ ] ✓ [ ] ✗ |

**Gate 2 Result:** [ ] PASS (all criteria met) [ ] FAIL (any fail)

---

### Gate 3: Device Readiness
**Required:** 3–4 criteria pass

| Criterion | Result | Pass? |
|-----------|--------|-------|
| iOS working | ___% [ ] ✓ [ ] ✗ |
| Android working | ___% [ ] ✓ [ ] ✗ |
| Desktop working | ___% [ ] ✓ [ ] ✗ |
| Audio/haptics functional | __ noted issues [ ] ✓ [ ] ✗ |

**Gate 3 Result:** [ ] PASS (3–4 criteria met) [ ] FAIL (<3 criteria met)

---

## Step 8: Final Gate Outcome

**Count gates that passed:**
- Gate 1 (Toy Factor): [ ] PASS [ ] FAIL
- Gate 2 (Friction): [ ] PASS [ ] FAIL
- Gate 3 (Device): [ ] PASS [ ] FAIL

**Total gates passed:** __ / 3

### Decision Logic

```
IF all 3 gates PASS:
  → OUTCOME A: SCALE TO FULL T115 TESTING

IF 2 gates pass + specific friction identified:
  → OUTCOME B: DO ONE MORE MICRO POLISH PASS

IF 0–1 gates pass OR core toy factor <6.0:
  → OUTCOME C: PAUSE THE PHYSICS LANE
```

**Outcome:** [ ] A: SCALE [ ] B: POLISH [ ] C: PAUSE

---

## Step 9: Recommendation & Rationale

### Summary Rationale (2–3 paragraphs)

**Why this outcome?**

___________________________

___________________________

___________________________

### Key Evidence

**Supporting data for outcome:**
1. ___________________________
2. ___________________________
3. ___________________________

### If B (Polish): Specific Fixes Needed

(Only fill if Outcome B selected)

**Top friction to address:**
1. ___________________________
2. ___________________________

**Estimated polish duration:** [ ] 1 day [ ] 2–3 days [ ] 3–5 days

**Re-test plan:** Re-run with same 8–12 pilots [ ] or [ ] lighter sample (4–6)

### If C (Pause): Post-Mortem Points

(Only fill if Outcome C selected)

**Root causes (if toy factor <6.0):**
1. ___________________________
2. ___________________________
3. ___________________________

**Potential redesign directions:** ___________________________

---

## Step 10: Next Phase Planning

### If OUTCOME A (Scale to Full T115):
```
Timeline: Week 1–2 of April
Scope: 20–50 players (full protocol per T115-Testing-Brief.md)
Parallel: Prepare for T116 expansion (2nd blockage, progression)
Success target: FLAGSHIP CANDIDATE classification
```

### If OUTCOME B (One More Polish Pass):
```
Timeline: 2–3 days quick iterations
Scope: Specific friction fixes (audio tuning, aiming clarity, etc.)
Re-test: Same 8–12 pilots (confirm fix effective)
Then: Scale to full T115 if re-test passes
```

### If OUTCOME C (Pause):
```
Timeline: 1 week post-mortem
Scope: Analyze core toy factor gap
Decision: Redesign vs. deprioritize vs. archive
Impact: Affects T116+ roadmap (physics lane status)
```

---

## Appendix: Raw Data Reference

### All Pilot Scores (For Reference)

| Player | Fun (1–10) | Retry | Aiming (1–5) | Share | Audio (1–5) | Device |
|--------|------------|-------|--------------|-------|-------------|--------|
| P01 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P02 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P03 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P04 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P05 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P06 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P07 | __ | Y/M/N | __ | Y/M/N | __ | ________ |
| P08 | __ | Y/M/N | __ | Y/M/N | __ | ________ |

---

**Analysis Complete.** Results ready for pilot report.

