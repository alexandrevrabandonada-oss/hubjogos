# Mobile Validation Checklist — Day 1 Mandatory

**Purpose:** Validate Mutirão playability on real mobile devices  
**When:** During Session 1 (mobile-first tester)  
**Who:** Operator observing + mobile tester  
**Device Required:** Actual smartphone (Android or iPhone)

---

## Device Under Test

| Field | Value |
|-------|-------|
| Device Model | |
| OS Version | |
| Screen Size | |
| Browser | |
| Browser Version | |
| Connection | ☐ WiFi ☐ 4G/5G |

---

## Pre-Test Setup

### Environment
- [ ] Quiet space for concentration
- [ ] Good lighting for screen visibility
- [ ] Comfortable seating/standing position
- [ ] Device fully charged (or plugged in)

### Console Prep
- [ ] Operator opens `/internal/playtest/mutirao` on separate device
- [ ] Operator starts session registration for mobile tester
- [ ] Mobile tester opens game URL on their device
- [ ] Confirm both connected to same telemetry system

---

## Touch Comfort Tests

### Test 1: Basic Tap Targets (Turn 1-2)
**Instruction to tester:** "Tap the action buttons naturally"

**Operator observes:**
- [ ] Can reach all buttons with thumb (one-handed)?
- [ ] Any accidental taps on wrong buttons?
- [ ] Any buttons too small to hit confidently?

**Issues noted:**
```

```

### Test 2: Scroll vs Tap (Turn 3-4)
**Instruction:** "Scroll down to see more, then tap an action"

**Operator observes:**
- [ ] Scroll gesture recognized smoothly?
- [ ] No accidental actions triggered while scrolling?
- [ ] Content stays readable during scroll?

**Issues noted:**
```

```

### Test 3: Repeated Actions (Turn 5-6)
**Instruction:** "Take several actions in quick succession"

**Operator observes:**
- [ ] Touch response feels immediate (< 300ms)?
- [ ] No missed taps?
- [ ] No double-triggering?

**Issues noted:**
```

```

---

## Text Density & Readability

### Test 4: Card Text (Any turn)
**Instruction:** "Read the action card text out loud"

**Operator observes:**
- [ ] Text large enough to read without zoom?
- [ ] Contrast sufficient?
- [ ] No text cut off or overflow?
- [ ] Line length comfortable for reading?

**Font size assessment:** ☐ Good ☐ Too small ☐ Way too small

**Issues noted:**
```

```

### Test 5: Resource Display (Turn 1)
**Instruction:** "Tell me your current energy and confiança"

**Operator observes:**
- [ ] Numbers visible without squinting?
- [ ] Icons distinct and recognizable?
- [ ] Color coding clear?

**Issues noted:**
```

```

### Test 6: Feedback/Risk Text (Any turn)
**Instruction:** "Read the risco de dengue warning"

**Operator observes:**
- [ ] Warning text prominent enough?
- [ ] Urgency communicated visually?
- [ ] Not overwhelming other info?

**Issues noted:**
```

```

---

## Action Clarity

### Test 7: Understanding Actions (Turn 1-2)
**Instruction:** "Describe what each action button does before tapping"

**Operator notes:**
```
Action 1 (name): Did tester understand? ☐ Yes ☐ Partial ☐ No

Action 2 (name): Did tester understand? ☐ Yes ☐ Partial ☐ No

Action 3 (name): Did tester understand? ☐ Yes ☐ Partial ☐ No
```

**Confusion markers to add:**
- [ ] "confusion" marker if any action misunderstood

### Test 8: Consequence Clarity (After action)
**Instruction:** "What just happened? What changed?"

**Operator notes:**
```
Did tester notice resource changes? ☐ Yes ☐ Partial ☐ No
Did tester understand why? ☐ Yes ☐ Partial ☐ No
```

**If unclear:** Add "confusion" marker with note about consequence clarity

---

## Perceived Performance

### Test 9: Initial Load
**Measure:** Time from tap to playable game

**Start:** Tester taps game link  
**End:** Game fully loaded and interactive  

**Load time:** ___ seconds  
**Acceptable?** ☐ Yes (< 5s) ☐ Borderline (5-10s) ☐ Too slow (> 10s)

**Issues noted:**
```

```

### Test 10: Turn Transitions
**Measure:** Time from action tap to next turn ready

**Turn 2 → 3 time:** ___ seconds  
**Turn 4 → 5 time:** ___ seconds  

**Acceptable?** ☐ Yes (< 2s) ☐ Borderline (2-5s) ☐ Too slow (> 5s)

**Issues noted:**
```

```

### Test 11: Scroll Performance
**Instruction:** "Scroll up and down the page several times"

**Operator observes:**
- [ ] Smooth 60fps scrolling?
- [ ] Any jank or stutter?
- [ ] Any delayed response?

**Performance:** ☐ Excellent ☐ Good ☐ Acceptable ☐ Poor

---

## Physical Comfort

### Test 12: Holding Position (After 5 minutes)
**Ask tester:** "How does your hand/arm feel?"

**Response:** ☐ Comfortable ☐ Slight strain ☐ Uncomfortable

**Issues noted:**
```
- Thumb reach issues: 
- Wrist angle issues: 
- Weight/heft issues: 
```

### Test 13: Session Duration Tolerance
**Track:** Did tester complete or abandon?

**Result:** ☐ Completed ☐ Abandoned at turn ___  
**Reason if abandoned:** ___________________

**Fatigue suspected?** ☐ Yes ☐ No

---

## Device-Specific Issues

### iPhone Specific (if applicable)
- [ ] Safe area respected (notch/dynamic island)?
- [ ] Bottom home indicator doesn't interfere?
- [ ] Safari UI chrome not blocking content?

### Android Specific (if applicable)
- [ ] Back button behavior correct?
- [ ] System navigation doesn't conflict?
- [ ] Various screen ratios handled?

**Issues noted:**
```

```

---

## Export Safety Verification

### Post-Session Data Check
After session completes:

- [ ] Mobile tester submitted feedback form?
- [ ] Operator marked session complete?
- [ ] Telemetry appears in Review tab?
- [ ] Operator notes preserved?

### Export Test
- [ ] Operator clicks "Download Pack"
- [ ] File size reasonable (> 5KB)?
- [ ] JSON structure valid?
- [ ] Mobile session data included?

**Backup check:**
- [ ] Screenshot of Review tab saved?
- [ ] Operator notes photographed/recorded?

---

## Mobile Summary

### Critical Issues (Must Fix Before Beta)
```
1. 
2. 
```

### Serious Issues (Fix During Sprint If Possible)
```
1. 
2. 
```

### Minor Issues (Polish Post-Sprint)
```
1. 
2. 
```

### Positive Findings
```
1. 
2. 
```

---

## Pass/Fail Assessment

| Category | Status |
|----------|--------|
| Touch targets | ☐ Pass ☐ Fail |
| Text readability | ☐ Pass ☐ Fail |
| Action clarity | ☐ Pass ☐ Fail |
| Performance | ☐ Pass ☐ Fail |
| Physical comfort | ☐ Pass ☐ Fail |
| Data capture | ☐ Pass ☐ Fail |

**Overall Mobile Readiness:**  
☐ READY FOR BETA  
☐ NEEDS FIXES FIRST  
☐ SIGNIFICANT REWORK NEEDED

---

**Operator:** _______________  
**Mobile Tester:** _______________  
**Date:** _______________  
**Duration:** _______________

**Notes:**
```

```
