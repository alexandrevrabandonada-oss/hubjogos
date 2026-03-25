# T76: Mobile Reality Audit Checklist

**Purpose:** Validate real-world mobile performance and usability.

---

## Mobile Test Requirements

### Minimum Device Coverage
| Device Tier | Example | Priority |
|-------------|---------|----------|
| Mid-range Android | Moto G Power, Samsung A14 | Mandatory |
| Entry iPhone | iPhone SE (2nd/3rd gen) | Mandatory |
| Flagship | iPhone 15, Galaxy S24 | Optional |

### Browser Coverage
| Browser | Version | Priority |
|---------|---------|----------|
| Chrome Mobile | Latest | Mandatory |
| Safari iOS | Latest | Mandatory |
| Samsung Internet | Latest | Recommended |

---

## Mobile Audit Checklist

### 1. Touch Comfort

**Test:** Can users accurately tap intended elements?

**Checklist:**
- [ ] Button touch targets ≥ 48x48dp
- [ ] No accidental taps on adjacent elements
- [ ] Scroll doesn't trigger unintended actions
- [ ] Double-tap zoom disabled (`touch-action: manipulation`)

**How to test:**
```
1. Load game on mobile device
2. Try tapping each button 5 times
3. Count accidental taps
4. Ask tester: "Foi fácil clicar onde queria?"
```

**Scoring:**
- **Good:** < 5% error rate
- **Acceptable:** 5-15% error rate
- **Poor:** > 15% error rate

**If Poor:**
- Increase touch target sizes
- Add spacing between buttons
- Review `touch-action` CSS
- Consider alternative layout for small screens

---

### 2. Readability

**Test:** Can users read all text without zooming?

**Checklist:**
- [ ] All body text ≥ 14px mobile
- [ ] Headers ≥ 16px mobile
- [ ] Buttons ≥ 14px
- [ ] High contrast (WCAG AA)
- [ ] No horizontal scrolling needed

**How to test:**
```
1. Load on 375px wide device (iPhone SE)
2. Read all text without zooming
3. Check in direct sunlight (outdoor test)
4. Ask: "Conseguiu ler tudo?"
```

**Scoring:**
- **Good:** No squinting, no zoom needed
- **Acceptable:** Minor strain on small text
- **Poor:** Must zoom to read

**If Poor:**
- Increase base font size
- Use viewport-relative sizing (`clamp()`)
- Improve contrast ratios

---

### 3. Layout & Responsiveness

**Test:** Does layout adapt gracefully to screen size?

**Checklist:**
- [ ] No overflow/horizontal scroll
- [ ] Key info visible without scrolling
- [ ] Status bar always visible
- [ ] Action buttons reachable (thumb zone)
- [ ] No elements cut off

**Breakpoints to test:**
| Width | Device Example | Status |
|-------|----------------|--------|
| 320px | iPhone SE (old) | ⬜ |
| 375px | iPhone 11/12 mini | ⬜ |
| 390px | iPhone 14 | ⬜ |
| 412px | Pixel 7 | ⬜ |
| 768px | iPad Mini (portrait) | ⬜ |

**Scoring:**
- **Good:** Clean layout on all tested sizes
- **Acceptable:** Minor issues on smallest screens
- **Poor:** Broken on some sizes

**If Poor:**
- Add more granular breakpoints
- Use CSS Grid/Flexbox better
- Prioritize content for small screens

---

### 4. Performance

**Test:** Does game run smoothly on mid-range devices?

**Metrics:**
| Indicator | Target | Test Method |
|-----------|--------|-------------|
| Frame rate | ≥ 30fps | Chrome DevTools FPS meter |
| Input lag | < 100ms | Feel test + DevTools |
| Load time | < 3s | Chrome DevTools Network |
| Battery usage | Not excessive | 15-min play test |
| Heat | Not hot to touch | Touch device after 10 min |

**How to test:**
```
1. Enable Chrome DevTools → Performance
2. Record 30 seconds of gameplay
3. Check FPS graph
4. Note any jank/long frames
```

**Scoring:**
- **Good:** Smooth 30fps+, no lag
- **Acceptable:** Occasional frame drops
- **Poor:** Noticeable lag or < 20fps

**If Poor:**
- Profile with Chrome DevTools
- Identify expensive renders
- Optimize CSS animations
- Reduce particle effects

---

### 5. Thumb Zone Accessibility

**Test:** Can user reach all controls with one hand?

**Checklist:**
- [ ] Primary actions in bottom 1/3 of screen
- [ ] Next turn button easily reachable
- [ ] No critical actions in top corners
- [ ] Status readable at top (OK if not interactive)

**Thumb zone heat map:**
```
┌─────────────────┐  ← Top: OK for status (read-only)
│    ⚠️ AVOID     │
│   INTERACTIVE   │
├─────────────────┤
│                 │
│    PREFERRED    │  ← Middle: Secondary info
│                 │
├─────────────────┤
│   ✓ PRIMARY     │  ← Bottom: Main actions
│   ACTIONS       │
└─────────────────┘
```

**How to test:**
```
1. Hold device in one hand (common grip)
2. Try to reach all buttons
3. Note any that require hand repositioning
4. Ask: "Conseguiu usar com uma mão?"
```

**Scoring:**
- **Good:** All main actions reachable
- **Acceptable:** One or two need stretch
- **Poor:** Must use two hands frequently

**If Poor:**
- Move primary actions down
- Use bottom sheet for actions
- Relocate next turn button

---

### 6. Scroll vs. Interaction

**Test:** Does scrolling conflict with game interactions?

**Checklist:**
- [ ] Scroll doesn't accidentally trigger actions
- [ ] Pinch zoom disabled on game area
- [ ] Game fits without scrolling (single screen)
- [ ] Or: Clear scrollable regions

**How to test:**
```
1. Scroll up/down on game area
2. Try to scroll within map
3. Check if accidental taps occur
4. Ask: "Teve problema com scroll?"
```

**Scoring:**
- **Good:** No conflicts, clear boundaries
- **Acceptable:** Minor occasional conflicts
- **Poor:** Frequent scroll/tap confusion

**If Poor:**
- Disable scroll on game area
- Use `overscroll-behavior: contain`
- Make game fit viewport
- Add clear touch boundaries

---

### 7. Input Responsiveness

**Test:** Does game respond immediately to input?

**Checklist:**
- [ ] Button feedback within 100ms
- [ ] No "double-tap to zoom" delay
- [ ] Visual feedback on touch
- [ ] No ghost clicks after scroll

**How to test:**
```
1. Tap buttons rapidly
2. Observe feedback timing
3. Check for delayed responses
4. Note any "stuck" feeling
```

**Scoring:**
- **Good:** Instant feedback
- **Acceptable:** Minor occasional lag
- **Poor:** Noticeable delays

---

### 8. Battery & Heat

**Test:** Is game respectful of device resources?

**Checklist:**
- [ ] Device doesn't overheat during 15-min session
- [ ] Battery drain reasonable (< 10% per 15 min)
- [ ] No excessive CPU usage when idle

**How to test:**
```
1. Play for 15 minutes
2. Feel device temperature
3. Check battery percentage before/after
4. Note if uncomfortably warm
```

**Scoring:**
- **Good:** Warm but not hot, minimal battery drain
- **Acceptable:** Slightly warm, moderate drain
- **Poor:** Hot to touch, heavy drain

---

## Mobile Audit Report Template

```markdown
# Mobile Reality Audit - Mutirão de Saneamento
**Date:** YYYY-MM-DD
**Devices Tested:** [List]
**Browsers:** [List]

## Summary
| Test | Device 1 | Device 2 | Device 3 | Status |
|------|----------|----------|----------|--------|
| Touch Comfort | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Readability | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Layout | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Performance | [FPS] | [FPS] | [FPS] | [PASS/CONCERN/FAIL] |
| Thumb Zone | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Scroll/Interaction | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Responsiveness | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |
| Battery/Heat | [Score] | [Score] | [Score] | [PASS/CONCERN/FAIL] |

**Overall Mobile Readiness:** [READY / NEEDS WORK / NOT READY]

## Device-Specific Findings

### Device 1: [Name]
**Issues Found:**
- [Issue 1]
- [Issue 2]

**Fixes Needed:**
- [Fix 1]
- [Fix 2]

### Device 2: [Name]
...

## Cross-Cutting Issues
| Issue | Devices Affected | Severity | Fix |
|-------|-----------------|----------|-----|
| [Issue] | [List] | [P0/P1] | [Action] |

## Recommendations

### Must Fix Before Beta (P0)
1. [Action]

### Should Fix (P1)
1. [Action]

### Nice to Have (P2)
1. [Action]

## Re-test Criteria
Re-test when:
- All P0 issues resolved
- Tested on at least 2 real devices
- No FAIL scores remain
```

---

## Quick Mobile Test Script

**5-Minute Smoke Test:**
```
1. Load on mobile device
2. Play through 3 turns
3. Tap each button at least once
4. Scroll up/down on page
5. Check: Can I read everything?
6. Check: Are buttons easy to tap?
7. Check: Does it feel responsive?

Pass if: No major issues found
Fail if: Can't play comfortably
```

---

*Mobile Reality Audit — Mutirão de Saneamento*  
*Sistema: Hub de Jogos — Pré Campanha*  
*Data: 24 de Março de 2026*
