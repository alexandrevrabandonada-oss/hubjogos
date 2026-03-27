# T96: Corredor Livre First Playable Style-Blockout + Movement Proof

**Status:** FIRST PLAYABLE SPEC — Production Ready  
**Date:** 27 de Março de 2026  
**Game:** Corredor Livre — Territorial Platformer  
**Phase:** First Playable Build  
**Predecessor:** T95 Art Production Pack (Approved)

---

## 1. Diagnosis: Why First Playable Now

### The Risk Being Addressed
T93-T95 established concept, art direction, and production pack. The next risk is **movement feel**:
- Does running feel satisfying?
- Is jump timing readable?
- Does the game feel good in the first 20 seconds?
- Can we prove this lane through play, not just concept?

### The Strategic Correction
**Do NOT:**
- Go back to pure graybox
- Wait for full final animation
- Build too much before testing feel

**DO:**
- Build style-blockout with rough-but-readable motion
- Test movement pleasure immediately
- Prove the lane through feel

### Success Criteria
| Criterion | Test |
|-----------|------|
| Running | Satisfying momentum, speed sensation |
| Jumping | Readable arcs, tight timing |
| Wall-kick | Useful and fun, not frustrating |
| Readability | Silhouette clear in motion |
| Atmosphere | Late-afternoon mood visible |
| First 20s | Fun without explanation overload |

---

## 2. Files to Create/Change

### New Implementation Files
| File | Purpose |
|------|---------|
| `reports/t96-corredor-livre-first-playable-style-blockout.md` | This document |
| `games/corredor-livre/playable/scope.md` | Build scope definition |
| `games/corredor-livre/playable/animation-set.md` | MVP animation plan |
| `games/corredor-livre/playable/movement-spec.md` | Feel targets |
| `games/corredor-livre/playable/level-layout.md` | Route structure |
| `games/corredor-livre/playable/readability-checklist.md` | Validation tests |
| `games/corredor-livre/playable/screenshot-audit.md` | Capture targets |
| `games/corredor-livre/playable/lane-verdict.md` | Final assessment |

---

## 3. Playable Build Scope

### 3.1 What to Build

**One Complete Segment:**
| Room | Purpose | Movement Test |
|------|---------|---------------|
| **1. Opening** | Rooftop run | Momentum, speed sensation |
| **2. Vertical** | Climb + wall-kick | Verticality, precision |
| **3. Hazard** | Police/tension | Risk/reward, escape |
| **4. Delivery** | Activation | Completion flow |
| **5. Victory** | Result | Emotional payoff |

**Metrics:**
- Total screens: 5
- Play time: 45-60 seconds
- Vertical range: 2 levels
- Horizontal: 8-10 screens

### 3.2 Style-Baseline Assets Required

**Character:**
- [ ] Base sprite (side view, 64px)
- [ ] 6 core animations (rough)
- [ ] Color: Orange hoodie (#FF6B35), dark pants

**Tiles (Minimum):**
- [ ] Laje (concrete slab) — 2 variants
- [ ] Telha (tile roof) — 2 variants
- [ ] Escada (stair) — 1 variant
- [ ] Ledge (wall-kick surface) — 1 variant
- [ ] Hazard (fence/hole) — 1 variant

**Props (Minimum):**
- [ ] Caixa d'água (platform)
- [ ] Varal (background)
- [ ] Poste (checkpoint)
- [ ] Police line (hazard)

**Background:**
- [ ] Sky gradient (late afternoon)
- [ ] Far city silhouette
- [ ] Mid hill houses (3-4 colors)
- [ ] Near wires (decoration)

### 3.3 What's NOT in First Playable

**Cut for Scope:**
- ❌ Full tile kit (30-40 tiles) — use 5-6 only
- ❌ All prop variants — use 4-5 only
- ❌ Full parallax (5 layers) — use 3 only
- ❌ Advanced moves (slide, climb, dash) — wall-kick only
- ❌ UI polish — minimal HUD
- ❌ Audio — placeholder or none
- ❌ Save system — session only

**Deferred:**
- Advanced animations (slide, climb, dash)
- Full 8-room scope
- All 5 screenshot states
- Complex hazards (unstable platforms)

---

## 4. Animation Plan

### 4.1 Minimum Viable Animation Set

**Required (Build These First):**

| Animation | Frames | Priority | Roughness Acceptable? |
|-----------|--------|----------|----------------------|
| **Idle** | 4 | High | ✅ Yes — breathing loop |
| **Run** | 6-8 | Critical | ✅ Yes — clear leg motion |
| **Jump (up)** | 2-3 | Critical | ✅ Yes — stretched pose |
| **Jump (down)** | 2-3 | Critical | ✅ Yes — landing prep |
| **Wall-kick** | 3 | High | ✅ Yes — contact, push, launch |
| **Land** | 2 | High | ✅ Yes — impact pose |
| **Interact** | 3 | Medium | ✅ Yes — hand extension |

**Total:** 7 animations, ~20-25 frames

**Optional (Add If Time):**

| Animation | Frames | Condition |
|-----------|--------|-----------|
| **Climb** | 4 | If vertical section feels empty |
| **Slide** | 2 | If hazard section needs it |
| **Dash** | 4 | If speed section needs burst |

### 4.2 Rough Animation Guidelines

**Acceptable Roughness:**
- [ ] Silhouette clear in all poses
- [ ] Key poses readable (contact, apex, land)
- [ ] Color consistent
- [ ] No fancy in-betweening required

**Not Acceptable:**
- [ ] Broken silhouettes
- [ ] Missing key poses
- [ ] Wrong colors
- [ ] Glitchy motion

**Production Shortcut:**
- Use 2-3 frame holds for simplicity
- Prioritize run cycle smoothness
- Other animations can be snappy

### 4.3 Animation Implementation Order

**Day 1-2:**
1. Idle (4 frames)
2. Run (6 frames)
3. Jump up/down (4 frames total)

**Day 3-4:**
4. Wall-kick (3 frames)
5. Land (2 frames)
6. Interact (3 frames)

**Day 5 (if time):**
7. Climb (4 frames) — if vertical section needs it

---

## 5. Implementation

### 5.1 Movement Feel Targets

**Running:**
| Parameter | Target | Feel |
|-----------|--------|------|
| Max speed | 8 units/sec | Fast but controllable |
| Acceleration | 0.5 sec to max | Responsive, not slippery |
| Friction | Quick stop | Tight, not ice physics |
| Turn | Immediate | Snappy direction change |

**Jumping:**
| Parameter | Target | Feel |
|-----------|--------|------|
| Height | 2.5 tiles | Challenging but reachable |
| Duration | 0.6 sec total | Readable arc |
| Variable | Hold = higher | Player control |
| Coyote time | 100ms | Forgiving edge jumps |
| Buffer | 100ms | Pre-land jump input |

**Wall-Kick (The Signature Move):**
| Parameter | Target | Feel |
|-----------|--------|------|
| Contact | Sticky | Clear "grab" feeling |
| Push | Strong | Satisfying launch |
| Angle | 45° up and away | Predictable trajectory |
| Window | 200ms | Generous but not infinite |

**Gravity:**
- Normal: 1.0x
- Jump up: 0.8x (float slightly)
- Jump down: 1.2x (fall faster)
- Wall-kick: 0.9x (control emphasis)

### 5.2 Room-by-Room Implementation

**Room 1: Opening Run (3 screens)**
```
[Sky] [Far city] [Mid hill]

        🏃💨
  ════════════════  ← Laje platform
  
Goal: Feel speed, momentum
Props: Varal background, caixa d'água
Hazard: None
Exit: Drop to lower level
```

**Implementation:**
- Flat laje surface
- Gentle ups and downs
- Space to build momentum
- Varals in background (atmosphere)
- Caixa d'água as vertical marker

**Success:** Player feels "this moves well" in 5 seconds.

---

**Room 2: Vertical Wall-Kick (2 screens)**
```
[Wall section]

    🏠
   ████  ← Ledge
   ████
  🏃→↗   ← Wall-kick
  ████
  ████
═══════
```

**Implementation:**
- Vertical wall with ledges
- Wall-kick zones marked (subtle highlight)
- Two kicks to reach top
- Small platform at top (reward)

**Success:** Wall-kick feels useful and satisfying.

---

**Room 3: Hazard Escape (2 screens)**
```
[Police line section]

    🔴🔵🔴
   ═══════
      🏃💨  ← Slide or jump over
   ███████
   █ Beco █
   ███████
```

**Implementation:**
- Police barrier as hazard
- Tight alley (compressed space)
- Player must time escape
- No damage, just reset or slow

**Success:** Tension without frustration.

---

**Room 4: Delivery/Activation (1 screen)**
```
[Goal area]

       💡
    ╭──────╮
    │ 🏃✋ │  ← Interact
    ╰──────╯
  ════════════
```

**Implementation:**
- Switch/door as activation
- Hand reach animation
- Light burst on success
- Clear feedback

**Success:** Action feels consequential.

---

**Room 5: Victory (1 screen)**
```
[Completion]

      ☀️
   🏠🏠🏠
     ✨✨
      🤸  ← Victory pose
  ═════════
  "Conectado"
```

**Implementation:**
- Freeze on victory pose
- Warm light burst
- Simple text feedback
- 3-second celebration

**Success:** Emotional payoff, screenshot moment.

---

## 6. Readability Review

### 6.1 Platform Edge Clarity

**Test:** Can player see where platform ends?

| Platform | Edge Mark | Status |
|----------|-----------|--------|
| Laje | 2px highlight | ✅ Clear |
| Telha | Pattern break | ✅ Clear |
| Ledge | Highlight strip | ✅ Clear |

**Action:** Ensure highlight visible on all edges.

### 6.2 Hazard Readability

**Test:** Can player identify danger?

| Hazard | Visual | Status |
|--------|--------|--------|
| Police line | Blue/red flash | ✅ Clear |
| Gap | Black void | ✅ Clear |
| Cerca | Red tint | ✅ Clear |

**Action:** Flash rate: 0.5s on/off (not seizure-inducing).

### 6.3 Wet Surface Readability (T95 Issue)

**Concern:** Wet surfaces too subtle in T95.

**Solution for First Playable:**
- [ ] Wet laje: Darker + subtle shimmer
- [ ] Add particle: Small splash on land
- [ ] Friction change: 0.8x (slippery feel)
- [ ] Test: Can player tell difference?

**Fallback:** If still unclear, cut wet surfaces from first playable.

### 6.4 Character Contrast Over Background

**Test:** Is orange hoodie visible against all backgrounds?

| Background | Contrast | Action |
|------------|----------|--------|
| Sky | ✅ High | None |
| Laje | ✅ High | None |
| Telha | ⚠️ Medium | Test 48px — may need outline |
| Shadow | ✅ High | None |

**Action:** Build with current colors, test on telha background.

### 6.5 Small-Screen Readability

**Test:** Mobile 48px readable?

| Element | 48px Test | Action |
|---------|-----------|--------|
| Character | Silhouette clear | ✅ Pass |
| Run cycle | Leg motion visible | ⚠️ Simplify if needed |
| Jump pose | Up/down clear | ✅ Pass |
| Platform | Edge visible | ✅ Pass |

**Action:** Test on actual mobile device Day 1.

---

## 7. Lane Verdict

### 7.1 Assessment Framework

**After First Playable, Classify as ONLY ONE:**

| Verdict | Criteria | Action |
|---------|----------|--------|
| **HIGH-POTENTIAL FLAGSHIP** | Movement feels great, screenshots strong, atmosphere clear | Full production greenlight |
| **PROMISING BUT NEEDS TUNING** | Core is good, but feel needs iteration | Iterate movement, keep art |
| **VISUALLY STRONG BUT FEEL WEAK** | Looks good, plays poorly | Pivot or cut scope |

### 7.2 Decision Matrix

| Factor | Weight | Score (1-10) | Weighted |
|--------|--------|--------------|----------|
| **Running pleasure** | 3x | ___ | ___ |
| **Jump readability** | 3x | ___ | ___ |
| **Wall-kick fun** | 2x | ___ | ___ |
| **Silhouette clarity** | 2x | ___ | ___ |
| **Atmosphere** | 2x | ___ | ___ |
| **First 20s fun** | 3x | ___ | ___ |
| **Screenshot power** | 2x | ___ | ___ |
| **Total** | | | ___/170 |

**Verdict Thresholds:**
- **140-170:** HIGH-POTENTIAL FLAGSHIP
- **100-139:** PROMISING BUT NEEDS TUNING
- **0-99:** VISUALLY STRONG BUT FEEL WEAK

### 7.3 Honest Verdict Template

**After Testing First Playable:**

```
VERDICT: [ONE OF THREE OPTIONS]

Rationale:
[One paragraph explaining why]

Scores:
- Running: ___/10
- Jump: ___/10
- Wall-kick: ___/10
- Silhouette: ___/10
- Atmosphere: ___/10
- First 20s: ___/10
- Screenshots: ___/10

Total: ___/170

Next Action:
[Specific recommendation]
```

---

## 8. Screenshot/GIF Audit

### 8.1 Capture Targets

**Must Capture From First Playable:**

| Shot | Moment | Use |
|------|--------|-----|
| **Run** | Opening sprint | Twitter/GIF |
| **Jump** | Apex over gap | Still/screenshot |
| **Wall-kick** | Push off wall | GIF (satisfaction) |
| **Hazard** | Near police line | Tension shot |
| **Victory** | Completion pose | Celebration |

### 8.2 GIF Specifications

| GIF | Duration | Frames | Loop |
|-----|----------|--------|------|
| Run cycle | 1 sec | 6-8 | Yes |
| Wall-kick | 0.5 sec | 3 | No (once) |
| Jump arc | 0.6 sec | Full | No |
| Victory | 2 sec | Hold | No |

### 8.3 Screenshot Specifications

| Shot | Resolution | Format | Use |
|------|------------|--------|-----|
| Opening | 1920x1080 | PNG | Hero image |
| Mid-jump | 1920x1080 | PNG | Feature shot |
| Hazard | 1920x1080 | PNG | Drama |
| Victory | 1920x1080 | PNG | Celebration |

### 8.4 Quality Bar

**Screenshot passes if:**
- [ ] Someone asks "what game is this?"
- [ ] Readable at thumbnail size
- [ ] Color palette distinctive
- [ ] Action clear without explanation

**GIF passes if:**
- [ ] Movement looks satisfying
- [ ] Loop is seamless (if looping)
- [ ] Under 5MB file size

---

## 9. Verification Summary

### 9.1 First Playable Completeness

| Section | Status |
|---------|--------|
| Build scope defined | ✅ 5 rooms, 45-60s |
| Animation set locked | ✅ 7 core, 3 optional |
| Movement targets | ✅ Speed, jump, wall-kick specs |
| Room layout | ✅ Opening → Vertical → Hazard → Delivery → Victory |
| Readability checklist | ✅ Platform, hazard, contrast |
| Lane verdict framework | ✅ 3-option decision matrix |
| Screenshot audit | ✅ 5 targets, GIF specs |

### 9.2 Production Readiness

**Can Start NOW:**
- [ ] Character sprite (64px side view)
- [ ] 5-6 tile variants
- [ ] 4-5 props
- [ ] 3 background layers
- [ ] Basic movement code

**Need Before Day 1:**
- [ ] Programmer assigned
- [ ] Artist for rough animations
- [ ] Test device (mobile + desktop)

### 9.3 Timeline

| Week | Activity | Deliverable |
|------|----------|-------------|
| 1 | Setup + Room 1 | Running feels good |
| 2 | Rooms 2-3 | Wall-kick + hazard working |
| 3 | Rooms 4-5 | Completion flow done |
| 4 | Polish + Test | First playable ready |
| 5 | Screenshot audit | 5 shots captured |
| 6 | Lane verdict | T96 report complete |

---

## 10. Immediate Next Actions

### Priority 1: Team Assembly (This Week)
- [ ] Assign programmer to Corredor Livre
- [ ] Assign artist for rough animations
- [ ] Schedule daily check-ins

### Priority 2: Day 1 Build (Next Week)
- [ ] Room 1: Opening run playable
- [ ] Idle + run + jump animations
- [ ] First feel test

### Priority 3: Week 2-3 (Full Build)
- [ ] All 5 rooms complete
- [ ] Wall-kick implemented
- [ ] Hazard section working

### Priority 4: Week 4-5 (Validation)
- [ ] Readability testing
- [ ] Screenshot capture
- [ ] Lane verdict

### Priority 5: Week 6 (Decision)
- [ ] T96 report complete
- [ ] Go/iterate/pivot decision
- [ ] Next phase planning

---

**T96 — Corredor Livre First Playable Style-Blockout + Movement Proof**  
**Sistema: Hub de Jogos — Pré Campanha**  
**Predecessor: T95 Art Production Pack (Approved)**  
**Successor: T97 Full Production OR Pivot**  
**Date: 27 de Março de 2026**
