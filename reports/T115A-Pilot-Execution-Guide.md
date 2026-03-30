# T115A Pilot Execution Quick Guide

**Your mission:** Run 8–12 player sessions, gate whether Desobstrução is ready for full-scale testing.

**Time to complete:** 3–4 days (recruit → run → analyze → decide)

---

## Jump To

1. **Pre-Pilot (Today)** → Recruitment starts
2. **Pilot Days** → Run 8–12 sessions
3. **Analysis Day** → Compile results, evaluate gates
4. **Decision Day** → Choose outcome (A/B/C), plan next phase

---

## Phase 1: Recruitment (Today, 2–3 hours)

### Task: Find 8–12 Real Players

**Where to recruit:**
- Friends, family, coworkers
- Gaming Discord/Slack communities
- Reddit r/playtesting or r/gamers
- Social media (ask for testers)
- Colleague networks

**Who to recruit:**

| Cohort | Count | Profile | Why |
|--------|-------|---------|-----|
| Mobile-first | 3–4 | Plays mainly on phone | Test haptics + touch |
| Desktop-first | 3–4 | Plays mainly on PC/Mac | Test audio + large screen |
| Casual | 2–3 | Non-core gamer, low context | Test if toy factor works without lore |

**Screening questions:**
- "What device do you primarily game on?" (helps categorize)
- "Have you played Angry Birds or Cut the Rope?" (reference baseline)
- "Can you do a 5-min session this [date/time]?" (confirm availability)

**Confirmation checklist for each tester:**
- [ ] Device confirmed (iPhone/Android/Mac/Windows)
- [ ] Browser confirmed (Safari/Chrome/Firefox)
- [ ] Internet connectivity OK
- [ ] Willing to use audio (speakers or headphones)
- [ ] Session time confirmed

---

## Phase 2: Run Pilot Sessions (Days 1–2, ~3 hours)

### Session Workflow (15 min per tester)

**Before session starts:**
1. Confirm device + browser online
2. Open `/arcade/desobstrucao` and load game
3. Quick orientation (30 sec):
   - "Destroy the barrier with a projectile"
   - "Different angles and power levels"
   - "No right answer—just try it"

**During play (2–5 minutes):**
- Watch silently (don't interrupt or guide)
- Note: Aiming confusion? Audio reaction? Retry eagerness?
- Log any device issues

**After play (2 minutes):**
- Have them fill out post-session questionnaire on the spot
- Or hand them the [T115A-Pilot-Metrics-Collection-Sheet.md](T115A-Pilot-Metrics-Collection-Sheet.md)

**Session data to capture:**
- Device + browser used
- Session length (how long they played)
- Play observations (confusion, audio reaction, retry desire)
- Post-session survey (fun, retry, aiming confidence, share)
- Any blocker flags

### Batch Sessions by Device Type

**Session 1–3: Mobile testers** (back-to-back if possible)  
**Session 4–6: Desktop testers** (separate batch)  
**Session 7–8: Casual testers** (mixed, flexible)

---

## Phase 3: Compile Results (Analysis Day, 2 hours)

### Step 1: Gather All Data Sheets
Collect all filled-out metrics sheets from pilot sessions.

### Step 2: Aggregate Into Results Template
Use [T115A-Pilot-Results-Aggregation.md](T115A-Pilot-Results-Aggregation.md)

**What to do:**
1. Fill in tester mix summary (how many mobile, desktop, casual)
2. Calculate 4 early signals:
   - Retry rate (% yes/maybe)
   - Fun factor (average 1–10)
   - Aiming confidence (average 1–5)
   - Would share (% yes/maybe)
3. Count blocker flags (any 3+ players flag same issue?)
4. Document top feedback themes

### Step 3: Evaluate 3 Gates
Check if each gate passes:

**Gate 1: Toy Factor Survival**
- Retry ≥70%? + Fun ≥7.0? + Share ≥50%?
- Need: 2–3 pass

**Gate 2: No Critical Friction**
- <3 players flag same blocker? + Aiming ≥4.0? + No "unusable" complaints?
- Need: All 3 pass

**Gate 3: Device Readiness**
- iOS works? + Android works? + Desktop works? + Audio/haptics OK?
- Need: 3–4 pass

---

## Phase 4: Gate Decision (Decision Day, 1 hour)

### Check Your Gates

```
IF Gates 1 + 2 + 3 ALL PASS:
  → OUTCOME A: SCALE TO FULL T115 TESTING
  → Action: Launch 20–50 player wave next week
  → Timeline: 1–2 weeks, decide FLAGSHIP CANDIDATE status

IF Gate 1 or Gate 2 partial fail + specific friction identified:
  → OUTCOME B: DO ONE MORE MICRO POLISH PASS
  → Action: Fix specific friction (audio tuning, aiming clarity, etc.)
  → Timeline: 2–3 days, re-test with same 8–12 pilots
  → Then: Re-run gates, scale if fixed

IF Multiple gates fail OR toy factor ≤6.0:
  → OUTCOME C: PAUSE THE PHYSICS LANE
  → Action: Post-mortem analysis, consider redesign
  → Timeline: 1 week analysis, strategic decision
  → Impact: May return to after other priorities
```

---

## Quick Reference: What to Watch For

### GREEN LIGHTS ✅ (Everything's working)
- >70% want to replay
- Fun rating >7
- Players immediately "get" aiming
- No device issues
- Audio feels contextual
- Players say "that was fun"

### YELLOW LIGHTS ⚠️ (Minor friction, not critical)
- 60–70% retry rate (still good, just lower)
- Fun rating 6–7 (decent but not great)
- 1–2 players confused by aiming (others got it)
- One device platform has minor issues
- Audio quality feedback mixed

### RED LIGHTS 🔴 (Major friction)
- <60% retry rate (players don't want more)
- Fun rating <6 (not engaging)
- 3+ players can't figure out aiming
- Core toy factor feels hollow
- Multiple platforms broken
- Players say "boring" or "confusing"

---

## Help During Pilot

### If Player Asks "What Do I Do?"
**Give minimal guidance:**
- "Just fire at the barrier and see what happens"
- "Different angles and power might work better"
- Don't explain mechanics beyond "destroy the barrier"

### If Audio Doesn't Play
- Check browser audio permission (may need to grant)
- Try different browser if first doesn't work
- Note it in session data (don't worry, game still works without audio)

### If Haptics Don't Work (Mobile)
- OK to skip—not critical for pilot
- You're mainly testing if toy factor works overall
- Note it: "Haptics experienced" or "Haptics not available"

### If Player Gets Frustrated Quickly
- That's valuable data! (fast boredom = red flag)
- Let them stop—don't push them to keep playing
- Interview: "What would make this more fun?"

### If Connection Drops Mid-Session
- Note it as device/network issue
- Can re-run that tester if time allows
- Or count partial session data only

---

## Decision Framework Cheat Sheet

| Outcome | When | Next Action |
|---------|------|------------|
| **A: SCALE** | All gates pass | Launch T115 full testing (20–50 players) |
| **B: POLISH** | Gate 1 or 2 partial fail, specific friction | Fix, re-test, then scale if approved |
| **C: PAUSE** | Multiple gates fail, toy <6.0 | Post-mortem, decide redesign or pivot |

---

## Expected Outcomes

**Based on T114 internal retest:** Estimated toy factor 90–105%

**Pilot success probability:** 70–75%

**Most likely:** OUTCOME A (SCALE TO FULL T115)

**If outcome B or C,** something unexpected happened—that's OK, just means iterate before big investment.

---

## Documents You Have

| Document | Purpose | When |
|----------|---------|------|
| [T115A-Desobstrucao-Pilot-User-Test.md](T115A-Desobstrucao-Pilot-User-Test.md) | Full test protocol | Pre-pilot (reference) |
| [T115A-Pilot-Metrics-Collection-Sheet.md](T115A-Pilot-Metrics-Collection-Sheet.md) | Per-session data form | During sessions (print/copy) |
| [T115A-Pilot-Results-Aggregation.md](T115A-Pilot-Results-Aggregation.md) | Data compilation template | Analysis day (fill in with all data) |
| This guide | Quick cheat sheet | All phases (reference while running) |

---

## Timeline

| Day | Task | Time |
|-----|------|------|
| **Today (Mar 30)** | Recruit 8–12 testers | 2–3 hours |
| **Day 1 (Mar 31)** | Run sessions 1–4 (Mobile + Desktop batch 1) | 1–2 hours |
| **Day 2 (Apr 1)** | Run sessions 5–8 (Desktop + Casual) | 1–2 hours |
| **Day 3 (Apr 2)** | Aggregate data, evaluate gates | 1–2 hours |
| **Day 4 (Apr 3)** | Final decision + planning for next phase | 30 mins |

**Total: 3–4 days**

---

## Success Criteria

You'll know the pilot succeeded if:

✅ Recruited 8–12 real players (any mix)  
✅ Ran 8+ sessions (minimum viable sample)  
✅ Collected data from all testers  
✅ Calculated 4 early signal metrics  
✅ Identified any blocker flags  
✅ Evaluated 3 gates  
✅ Made clear A/B/C decision  
✅ Documented rationale  

**If you have all of ✅, you're ready to move forward.**

---

## Red Lines

**Stop and re-run a session if:**
- You didn't capture Retry desire data
- You didn't capture Fun factor (1–10)
- You forgot to log device/browser used
- Session was <1 min or >8 min (way outside normal)

**These 4 data points are non-negotiable for the gate decision.**

---

## Next Steps

1. **Right now:** Start recruiting (call 12–15 people to hit 8–12 who confirm)
2. **Tomorrow:** Run first batch of sessions
3. **Day 3:** Finish remaining sessions + start data compilation
4. **Day 4:** Evaluate gates, make final decision
5. **Day 5:** Deliver recommendation + plan next phase

---

## File to Create After Pilot

Once results are compiled, create:

**`reports/T115A-Pilot-Findings.md`**

This will have:
- Tester mix summary
- 4 signal metrics results
- Top feedback themes
- Gate evaluations
- Final outcome (A/B/C) + rationale
- Next phase recommendation

---

**Good luck! You've got this.** 🚀

