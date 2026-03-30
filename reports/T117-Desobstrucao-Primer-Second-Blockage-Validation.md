# T117 — Desobstrução Primer + Second Blockage Validation

**Date:** March 30, 2026  
**Scope:** Validation wave design + pre-wave technical assessment for T116 build  
**Status:** NEEDS ONE MORE DEPTH/ONBOARDING PASS — wave must run before T118 escalation

---

## Diagnosis

T116 delivered two focused upgrades: an interactive gesture primer for touch devices and one second blockage variant (steel grate). Before this validation report was authored, a code audit uncovered one pre-validation blocker that was patched immediately (see Pre-Validation Fix below). The technical foundation after the patch is sound. However, the critical questions for T118 escalation — does the primer actually remove mobile friction, and does steel feel like depth rather than padding — require live player data from the 12–18 person wave specified in this document.

This report provides: the patch applied, the wave design, the technical baseline assessment, the measurement protocol, and the honest outcome.

---

## Pre-Validation Fix (Critical)

**Bug found:** `activateNextBlockage()` did not reset the attempt counter when transitioning from concrete to steel phase.

**Impact:** A player clearing concrete in 6 of 8 attempts would start the steel phase with only 2 attempts remaining. This truncates the steel experience artificially, producing invalid depth data — players would fail on steel due to budget exhaustion, not difficulty. Any wave run before this fix would return misleading "second blockage feels unfair" signals.

**Fix applied (`components/games/arcade/DesobstrucaoPhysicsSlice.tsx`):**
- Added `gameStateRef.current.attempt = 0` and `setAttempt(0)` inside `activateNextBlockage`.
- Each phase now has an independent 8-attempt budget.

**Verification:** TypeScript noEmit passes. E2E proof spec (T116) remains 4/4.

---

## Files Changed

- `components/games/arcade/DesobstrucaoPhysicsSlice.tsx` — attempt counter reset on steel phase entry

## Files Created

- `reports/T117-Desobstrucao-Primer-Second-Blockage-Validation.md` — this document

---

## Validation Wave Design

### Tester mix

| Segment | Count | Why |
|---|---|---|
| Compact-screen mobile (≤375px physical) | ≥6 | Primary primer validation target |
| Android specifically | ≥3 | Touch gesture recognition differs from iOS |
| Desktop | ≥3 | Primer bypass path + baseline toy factor |
| Casual / low-context (first session) | ≥4 | Primer friction most visible in cold start |
| Returning T115 players | ≥2 | Before/after depth comparison |
| **Total** | **12–18** | |

Minimum condition to run the wave: compact-screen and Android quotas must be filled. Desktop-only results do not validate the primer.

---

## Validation Findings

### 1. Primer assessment

#### Technical baseline (code audit)

**What is implemented:**
- State machine: `guiding → success → done`
- Touch device detection via `window.matchMedia('(pointer: coarse)')`
- Gesture gate: rightward drag (dx > 22% of view width) + upward component (dy < −12% of view height)
- Live progress bar tied to actual drag displacement
- Animated ghost puck pre-showing the expected motion path
- 700ms success acknowledgment state before control unlock
- Desktop users bypass entirely

**Calibration on compact screens:**
- At 320px logical width: threshold = ~70px horizontal + ~38px upward
- At 375px logical width: threshold = ~82px horizontal + ~45px upward
- Both fall within comfortable single-thumb reach on 5–6 inch devices

**Confirmed strengths:**
- Ghost puck animation signals affordance before any instruction text
- Progress bar gives real-time feedback rather than a binary pass/fail
- 700ms success window prevents micro-hesitation from bypassing acknowledgment
- Primer overlay uses `pointer-events: none` — the canvas below remains the interaction surface throughout

**Identified UX risk (not a bug, requires observation):**
The primer card visually presents instructions but the drag gesture must be performed on the canvas below it, not on the card. On compact screens where the card covers ~30–40% of visible height, some players may attempt to tap or drag the card itself before discovering they need to drag the canvas. This will not break the primer — those touches are simply ignored and the player must try elsewhere — but it could add 3–8 seconds of confusion per player. Monitor for this pattern in the wave.

#### Measurement signals (collect during wave)

| Signal | Proxy for | Target |
|---|---|---|
| Time from page load to first FIRE RAMMER tap | Primer latency / confusion | < 25s median |
| Abandons/reloads before first fire | Confusion threshold crossed | < 2/12 players |
| Players who complete primer on first drag attempt | Gesture discoverability | > 70% |
| Verbal or written "didn't know how to aim" | Residual confusion | < 3/12 players |
| Observed interaction pattern (card vs. canvas) | Pointer-events mismatch gap | Note occurrences |

---

### 2. Second blockage assessment

#### Technical baseline (code audit)

**What is implemented:**
- 6 vertical slats (0.12×1.2×0.18, mass 32) + 2 horizontal braces (2.0×0.14×0.18, mass 26)
- Comparison: concrete is 4 larger rectangular blocks — unambiguously different silhouette
- Break rhythm: nearest slat snaps first, 2 side slats follow if force > 1.12× threshold (cascade lateral spread)
- Concrete break: downward momentum bias; steel break: 1.2× lateral bias on slats, 0.8× on braces — pieces scatter sideways, not down
- Angular velocity differential: slat 9 rad/s vs. brace 6 rad/s — gives a "rattling loose bars" sound profile vs. concrete "chunks falling"
- Health: steel 120 vs. concrete 100 — slightly more durable, appropriate for second-phase difficulty
- Health bar turns gray/steel gradient on transition — persistent visual cue of phase
- Stage swap: amber badge "Blockage 2 unlocked • Steel Grate" visible for 1200ms
- Header counter shows "2/2" during steel phase
- Restoration chime + "CLEARED" overlay only after steel cleared — completion state is phase-gated

**Confirmed distinctiveness:**
Steel differs from concrete across all four design axes from the T116 spec: silhouette (slatted vs. slab), break pattern (segment snap vs. cascade), hit response (lateral scatter vs. downward break), reward feel (two-phase completion vs. single resolution). This is genuine mechanical distinction, not palette-swap.

**Identified depth risk (structural, not a code bug):**
When concrete clears, the first moment of expected satisfaction is interrupted by the stage flash and the steel introduction. Players who expect the game to end at concrete clear may experience the steel transition as a penalty rather than a reward. The stage flash and "2/2" counter mitigate this by communicating the two-phase structure — but this depends on players reading the header counter early enough. Players who never look at headers (a known compact-screen pattern) will miss the "2/2" signal until the swap happens.

#### Measurement signals (collect during wave)

| Signal | Proxy for | Target |
|---|---|---|
| Players who identify two distinct materials without prompting | Silhouette readability | > 8/12 |
| Players who describe a different "feel" for steel hits | Break rhythm distinction | > 7/12 |
| Replay desire after two-phase completion vs. T115 baseline | Depth contribution | ≥ equal to T115 |
| Verbal "second one felt like padding" | Repetition risk | < 3/12 |
| Verbal "wanted to see what came next" | Depth desire | > 5/12 |
| Stage flash noticed | Transition clarity | > 9/12 |

---

### 3. Toy factor check

#### T115 validated core — confirmed unchanged

| Parameter | T115 value | T116/T117 value | Delta |
|---|---|---|---|
| Gravity baseline | Validated | Unchanged | 0 |
| Rammer mass and arc | Validated | Unchanged | 0 |
| Launch audio | Validated | Unchanged | 0 |
| Impact crunch audio | Validated | Unchanged | 0 |
| Cascade rattle audio | Validated | Unchanged | 0 |
| Restoration chime | Validated | Unchanged | 0 |
| Haptic pattern (launch) | Validated | Unchanged | 0 |
| Haptic pattern (impact) | Validated | Unchanged | 0 |
| Core attempt loop | Validated | Unchanged | 0 |
| Max attempts per phase | 8 | 8 (each phase) | Fixed |

**Key risk to monitor:** Does the concrete → steel transition dilute the satisfaction of the first impact moment? Concrete clear was previously the terminal satisfaction event. It is now a mid-point. The stage flash provides a small celebration, but it is brief (1200ms) and informational ("Steel Grate") rather than celebratory. If the wave shows toy factor dip, the concrete-clear celebration needs amplification before T118.

#### Measurement signals (collect during wave)

| Signal | Proxy for | Target |
|---|---|---|
| "Impact still feels satisfying" rating | Impact pleasure preservation | ≥ T115 median |
| Retry initiated without prompting | Retry desire | ≥ T115 rate |
| Verbal "felt long" or "tedious" | Session length regression | < 3/12 |
| Time to complete two-phase session | Loop duration | < 90s median |
| Net Promoter Score equivalent (1–5) | Overall satisfaction | ≥ T115 score |

---

### 4. Qualitative feedback clusters

Collect open-ended feedback after each session. Cluster by the following labels:

| Cluster | Positive signal | Negative signal |
|---|---|---|
| Primer effectiveness | "primer helped", "easy to figure out", "one drag and I got it" | "still confused on mobile", "didn't understand swipe", "tapped the screen but nothing happened" |
| Steel distinctiveness | "steel felt distinct", "different kind of satisfying", "liked the scatter" | "second blockage felt repetitive", "same thing twice", "no difference" |
| Depth quality | "felt deeper", "wanted more content", "two phases felt right" | "felt like the game wouldn't end", "too long", "second phase annoyed me" |
| Toy factor | "impact still punchy", "loved the crunch", "kept retrying" | "lost the punch", "felt weaker than first one", "second blockage boring to destroy" |

Minimum cluster data before classifying: at least 5 unique sessions with open-ended notes. Do not classify from fewer.

---

## Outcome

### Evidence weighed

| Dimension | Status |
|---|---|
| Pre-validation bug (attempt counter) | **FIXED** before wave |
| Primer mechanism — technical correctness | SOUND |
| Primer effectiveness — live player data | **PENDING** |
| Steel distinctiveness — technical proof | STRONG |
| Steel depth feel — live player data | **PENDING** |
| Toy factor core — preserved from T115 | CONFIRMED |
| Two-phase transition feel — live player data | **PENDING** |

### Classification

**NEEDS ONE MORE DEPTH/ONBOARDING PASS**

The engineering is complete. The pre-validation bug is patched. The technical evidence for both the primer mechanism and steel distinctiveness is strong. What is still missing is confirmation that these improvements work as experienced by real players on real compact devices.

This is not a weakness of the implementation — it is the normal validation gap between "code correct" and "experience validated." T117 is specifically the human pass required to close that gap.

### Conditions for T118 escalation

After the wave runs, escalate to READY FOR T118 FLAGSHIP PACKAGING if and only if all three of the following are true:

1. **Primer completion rate ≥ 70% on first drag attempt** among compact-screen players
2. **Steel distinctiveness recognition ≥ 8/12 players** without prompting (blind identification)
3. **Toy factor rating at or above T115 median** (no satisfaction regression)

If any of these three conditions fails, apply the targeted patch before T118 and do not escalate blindly.

### What T118 is blocked on

T118 flagship packaging should not begin until:
- Wave has run with required tester mix (compact-screen quota especially)
- Cluster data is collected from ≥12 sessions
- Conditions above are confirmed or targeted patches applied

---

## Verification Summary

| Item | Status |
|---|---|
| Pre-validation bug found and fixed | ✓ |
| TypeScript noEmit post-fix | ✓ exit 0 |
| T116 E2E proof spec post-fix | ✓ 4/4 |
| Attempt counter independent per phase | ✓ |
| Primer architecture reviewed | ✓ sounds |
| Steel grate distinctiveness audited | ✓ strong |
| Toy factor core preservation confirmed | ✓ unchanged |
| Pointer-events mismatch risk flagged | ✓ monitor |
| Concrete-clear satisfaction risk flagged | ✓ monitor |
| Wave design documented with quotas | ✓ |
| Measurement signals specified | ✓ |
| T118 escalation conditions defined | ✓ |
