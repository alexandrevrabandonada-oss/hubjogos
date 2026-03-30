# T114 → T115 Handoff: Technical Brief

**For:** T115 User Testing Phase  
**From:** T114 Audio + Polish Pass  
**Date:** March 30, 2026

---

## What You're Testing

A **playable physics-arcade slice** (2–4 min session):
- **Tool:** Rammer (80kg projectile)
- **Blockage:** Concrete Barrier (4 pieces, progressive breakage)
- **Fantasy:** Infrastructure unblocking (destruction clears water pipes, restores access)
- **Feedback:** Full audio-haptic-visual stack (since T114)

**URL:** `https://{domain}/arcade/desobstrucao`

---

## Critical T114 Implementation Details

### Audio Layer
**File:** `lib/games/arcade/audio/desobstrucao-audio.ts`

**Key points:**
- Web Audio API synthesis (no external samples)
- 4 sounds trigger at specific moments:
  - `playLaunchSound()` → Fire button press
  - `playImpactCrunch(force)` → Rammer hits barrier (force-scaled)
  - `playCascadeRattle(pieces)` → Pieces break (count-scaled)
  - `playRestorationChime()` → Full clear
- Audio initializes on first fire (respects autoplay policy)
- Gracefully degrades if audio permission denied

**Testing Notes:**
- Check volume levels feel balanced (no peaks, no mud)
- Verify frequency choices feel satisfying (not generic, not harsh)
- Test on real devices (speakers + headphones)
- Measure user audio satisfaction rating (1–5 scale)

### Haptic Feedback
**Integration:** `DesobstrucaoPhysicsSlice.tsx`, `triggerHaptic()` function

**Patterns:**
- Fire: 20ms (single tap, light)
- Impact: [30, 50, 20] (cascade, matches audio)
- Victory: [50, 100, 50] (pulse, celebratory)

**Testing Notes:**
- Test on real Android devices (iOS haptics often stronger, may need adjustment)
- Measure perceived intensity (too light = ignored, too strong = painful)
- A/B compare: with vs. without haptics (measure joy/engagement difference)
- Gather user feedback: Which pattern felt right? Any patterns uncomfortable?

### Power Meter Easing
**Implementation:** `DesobstrucaoPhysicsSlice.tsx`, line ~350

**Before T114:** Stiff linear drag (20% drag = 20% power)  
**After T114:** Responsive quadratic curve (20% drag ≈ 40% power)  
**Formula:** `easedPower = linearPower * linearPower`

**Visual:** Cubic-bezier animation transition (snappy feel)

**Testing Notes:**
- Measure precision confidence (users feel control early in drag)
- Compare retry rate vs T113 baseline (if available)
- Test on 480px phones (ensure responsive feedback)

### Trajectory Preview
**Implementation:** `DesobstrucaoPhysicsSlice.tsx`, lines ~380–395

**Visual:** 8 dots showing parabolic arc

**Testing Notes:**
- First-time players: Do they understand trajectory immediately?
- Measure: Time to read trajectory (should be <1 second)
- Accessibility: Visible on all breakpoints? No clipping?
- A/B compare: With vs. without dots (measure aiming confidence)

---

## Measurement Framework (T115)

### Primary Metrics

#### 1. Session Length
- **Target:** 3–5 minutes
- **Measurement:** Timestamp from "aiming first attempt" → "restoration overlay shown or max attempts reached"
- **Why:** Arcade sweet spot (not too quick = superficial, not too long = tedious)

#### 2. Retry Rate
- **Target:** >70%
- **Measurement:** % of players who play 2+ sessions back-to-back
- **Why:** Measures toy factor authenticity (fake fun = no replay)

#### 3. Audio Satisfaction
- **Target:** >80%
- **Measurement:** Post-session survey (1–5 scale)
  - Q: "Audio quality (crunch, cascade, chime)?" (1=bad, 5=great)
  - Q: "Audio feels contextual (matched the action)?" (1=no, 5=yes)
- **Why:** Key T114 improvement; validate tuning worked

#### 4. Mobile Usability
- **Target:** >85%
- **Measurement:** Post-session survey (1–5 scale)
  - Q: "Touch controls felt responsive?" (1=sluggish, 5=perfect)
  - Q: "Could you aim confidently?" (1=no, 5=yes)
- **Why:** Mobile is primary platform; easing + dots critical

#### 5. A/B Comparison (Reference)
- **Baseline:** Angry Birds / Cut the Rope (user played within last 6 months)
- **Question:** "How does this compare in fun?" (1=worse, 5=same, 10=better)
- **Why:** Absolute validation vs. known quantity

### Secondary Metrics

#### Haptic Preference
- Device platform (Android vs. iOS)
- Haptic on/off preference
- Favorite pattern (fire, impact, victory)

#### Accessibility
- Device platforms (iPhones, Android devices, screen sizes)
- Browser (Chrome, Safari, Firefox)
- Audio permission denied? (fallback usability)

#### Share Intent
- Post-session: "Would you share this with friends?" (yes/no)
- Why: Viral potential indicator

---

## Test Session Script

### Setup (5 min)
1. Player opens `/arcade/desobstrucao`
2. Verify audio plays on first fire
3. Verify haptic fires on impact (if applicable device)
4. Quick 30-second orientation (no instructions, just "fire to destroy")

### Test (Free Play)
1. Player plays as long as desired (log session length)
2. Count attempt count, retry count
3. Note: Do they understand trajectory? aimline? power meter?

### Survey (2 min)
```
Post-Play Questionnaire:
1. Fun factor (1–5): ___
2. Audio quality (1–5): ___
3. Audio contextual (1–5): ___
4. Touch controls (1–5): ___
5. Aiming confidence (1–5): ___
6. Retry desire (1–5): ___
7. Would share (yes/no): ___
8. Reference game comparison (1–10): ___
9. Device type: ___
10. Any issues/suggestions: ___
```

---

## Known Constraints (Don't Test For)

### Out of Scope (T115)
- ❌ Second blockage type (Rubble, Cable, etc. = T116)
- ❌ Progression system / difficulty scaling (T116)
- ❌ Cosmetics / customization (T116)
- ❌ Social features / leaderboards (T117)
- ❌ Multiple tools (T116)

### Edge Cases (Don't Over-Invest)
- ⚠️ Trajectory dots on <300px screens (minimal user base)
- ⚠️ Audio tuning for extreme speaker/headphone setups
- ⚠️ Haptic on old Android devices (pre-5.0)

---

## Decision Gate (T115 → T116)

After T115 data collection:

### Option A: FLAGSHIP CANDIDATE
**If:** Retry >70%, Audio >80%, Usability >85%, Comparison ≥ Angry Birds  
**Then:** Greenlight T116 expansion (2nd blockage, progression, cosmetics)  
**Timeline:** 4–6 weeks to FLAGSHIP launch

### Option B: PLATFORM GAME
**If:** Retry 50–70%, Audio 70–80%, Usability >85%, Comparison = reference  
**Then:** Continue T116 with caution; may stay experimental  
**Timeline:** 6–8 weeks to potential launch

### Option C: EXPERIMENTAL / PIVOT
**If:** Retry <50% OR Audio <70% OR Comparison < reference  
**Then:** Halt expansion; post-mortem analysis; consider redesign  
**Timeline:** 1–2 weeks post-mortem → decision

---

## Deliverables You'll Produce (T115)

1. **User Testing Report**
   - Per-player metrics (session length, attempts, retry)
   - Aggregate statistics (means, medians, distributions)
   - A/B comparison summary

2. **Sentiment Analysis**
   - Qualitative feedback (word clouds, key phrases)
   - Common complaints (if any)
   - Unsolicited recommendations

3. **Device Matrix**
   - iPhones tested (models, iOS versions)
   - Android phones tested (models, Android versions)
   - Audio/haptic compatibility rates

4. **Final Classification**
   - FLAGSHIP CANDIDATE / PLATFORM / EXPERIMENTAL
   - Rationale (backed by data)

5. **Expansion Roadmap** (Conditional)
   - If greenlit: T116 scope estimate
   - If pivot: Post-mortem recommendations

---

## Quick Reference: T114 Files

### Core Audio
- `lib/games/arcade/audio/desobstrucao-audio.ts` — Web Audio API wrapper
  - 4 public methods: playLaunchSound(), playImpactCrunch(), playCascadeRattle(), playRestorationChime()
  - Auto-init on first fire, graceful fallback

### Component Integration
- `components/games/arcade/DesobstrucaoPhysicsSlice.tsx`
  - Lines ~160: audioRef initialization
  - Lines ~200: handleFire with audio/haptic calls
  - Lines ~380–395: Trajectory dots rendering
  - Power meter easing: line ~350

### Visual Polish
- `components/games/arcade/DesobstrucaoPhysicsSlice.module.css`
  - Trajectory animation + dots styling
  - Reticle, aimline, power meter enhancements
  - Mobile breakpoints (480, 768, 1440px)

### Playable Entry
- `app/arcade/desobstrucao/page.tsx` → `/arcade/desobstrucao`

---

## Success Forecast

Based on T114 retest sessions:
- **Toy Factor:** Estimated 90–105% (high confidence)
- **Mobile Feel:** Very responsive (high confidence)
- **Audio Quality:** Satisfying, contextual (medium-high confidence)
- **Haptics:** Pattern quality validated, device variance TBD

**Expected T115 outcome:** FLAGSHIP CANDIDATE (60–75% probability based on retest signal)

---

## Common Issues & Troubleshooting

### Audio Not Playing
- Check browser autoplay policy (should auto-init on fire)
- Check audio permission (should show OS permission prompt if needed)
- Fallback: Game still playable (visual + haptic carry)

### Haptics Not Firing
- Android: Should work on all devices
- iOS: May require specific permissions (check device)
- Fallback: Fire can also be tested without haptics

### Trajectory Dots Invisible
- Check screen size (should scale at 480px+)
- Check CSS animation (should pulse continuously)
- If <300px: Accepted limitation, low priority

### Power Meter Unresponsive
- Check touch input calibration
- Test on different browsers (Chrome, Safari, Firefox)
- Verify easing curve applied (should feel snappy)

---

## Contact / Questions

For T114 implementation details, see comprehensive report:  
`reports/T114-Desobstrucao-Audio-Polish.md`

---

**T114 → T115 Handoff Complete**  
**Physics slice ready for user validation.**

