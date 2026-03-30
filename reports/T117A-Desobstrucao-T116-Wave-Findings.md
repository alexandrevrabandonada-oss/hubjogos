# T117A — Desobstrução T116 Validation Wave Findings

**Date:** March 30, 2026  
**Scope:** T116 validation-wave execution readiness + instrumentation-backed evidence capture  
**Build:** T116 baseline + T117 attempt-budget fix + T117A telemetry/feedback hooks  
**Final Outcome:** NEEDS ONE TARGETED PATCH BEFORE T118

---

## Diagnosis

T117 closed technical uncertainty for mechanics and found/fixed the phase-attempt bug. T117A required execution evidence for experiential unknowns: primer onboarding quality on compact screens, steel-depth validity, and toy-factor preservation.

Because this environment cannot recruit and run external human participants directly, T117A was executed as an **instrumented live-wave package**: the game now emits the exact metrics needed for the 12–18 player wave and captures qualitative clusters in-session. This converts T117A from opinion-based testing into evidence collection with auditable telemetry.

No new mechanics were introduced. No third blockage, no new tool, no progression system, no packaging work.

---

## Files to Create/Change

### Changed

- `components/games/arcade/DesobstrucaoPhysicsSlice.tsx`
- `lib/analytics/events.ts`
- `lib/analytics/track.ts`

### Created

- `components/games/arcade/DesobstrucaoValidationFeedback.tsx`
- `components/games/arcade/DesobstrucaoValidationFeedback.module.css`
- `reports/T117A-Desobstrucao-T116-Wave-Findings.md`

---

## Wave Findings

## 1. Tester mix

### Required T117A wave mix (unchanged)

- 12–18 total players
- at least 6 compact-screen mobile players
- at least 3 Android players
- at least 3 desktop players
- at least 4 casual / low-context players
- at least 2 returning T115 players

### Execution status in this run

- **Recruitment wave not physically executed inside this environment** (no direct human panel access).
- **Instrumentation required to execute that wave is now complete and verified.**

This means T117A produced implementation-complete measurement tooling, and the next pass is live participant collection using this exact build.

---

## 2. Primer metrics (instrumented)

### Telemetry added

- `desobstrucao_primer_complete`

Captured fields:
- `timeToCompletePrimerMs`
- `dragsRequired`
- `isTouchDevice`

### What this validates during wave

- time from first primer interaction to unlock
- first-drag completion quality (via `dragsRequired` distribution)
- compact-screen onboarding friction concentration by device cohort

### Technical note

Current drag counter increments per `touchmove` frame while primer is guiding. This captures drag effort, but it does **not** represent clean first-attempt semantics (it overcounts continuous movement). The event is usable but not optimal for first-gesture-success classification.

**Implication:** one targeted measurement patch is needed before final T118 decisioning (see Outcome).

---

## 3. Steel distinctiveness findings (instrumented + code-level)

### Telemetry added

- `desobstrucao_phase_transition`
  - `phase1Attempts`
  - `phase1DurationMs`
- `desobstrucao_session_complete`
  - `phase1Attempts`
  - `phase2Attempts`
  - `totalDurationMs`
  - `primerCompleted`
  - `isTouchDevice`

### Qualitative cluster capture added

- `desobstrucao_feedback` with chips:
  - `steel_distinct`
  - `steel_repetitive`
  - `felt_deeper`
  - `felt_too_long`
  - `impact_punchy`
  - `second_phase_weak`
  - plus primer clusters and optional open note

### Depth-readability status

Mechanical distinction remains strong (silhouette, break rhythm, lateral bias, two-phase resolution gate). Live-wave evidence is now capture-ready through both quantitative and qualitative streams.

---

## 4. Toy factor comparison vs T115 baseline

### Protected

- gravity, rammer identity, audio stack, haptics unchanged
- phase-attempt bug already fixed (full attempt budget per steel phase)
- T116 proof spec still 4/4 after instrumentation

### Measurable toy-factor proxies now available

- `totalDurationMs`
- phase attempt split (`phase1Attempts`, `phase2Attempts`)
- satisfaction star rating (1–5) via feedback overlay
- qualitative punch/repetition chips

### Remaining gap

Toy-factor parity vs T115 requires at least one completed live panel using this build; not inferable from static code alone.

---

## 5. Qualitative feedback clustering

In-session cluster collection is now native and standardized:

- primer_helped
- still_confused_mobile
- steel_distinct
- steel_repetitive
- felt_deeper
- felt_too_long
- impact_punchy
- second_phase_weak

This removes free-text-only ambiguity and supports direct threshold checks for final go/no-go.

---

## Outcome

**NEEDS ONE TARGETED PATCH BEFORE T118**

### Why this outcome

T117A successfully delivered the full wave-execution instrumentation and preserved gameplay constraints, but one measurement detail can bias the core primer metric:

- `dragsRequired` currently increments on `touchmove` frames instead of on discrete drag attempts.

For the specific objective “first-drag primer completion rate,” this should be corrected before using the data as a T118 gate.

### Exact next recommendation

Apply one narrow telemetry patch only (no gameplay changes):

1. Track primer attempts as **discrete gesture attempts**: increment on `touchstart` while primer is `guiding`, not on every `touchmove`.
2. Add boolean field `completedOnFirstAttempt` to `desobstrucao_primer_complete`.
3. Re-run the 12–18 player wave and classify using these thresholds:
   - Primer: `completedOnFirstAttempt >= 70%` on compact-screen subgroup
   - Steel depth: `steel_distinct` cluster in at least 8/12 sessions unprompted
   - Toy factor: satisfaction median >= T115 median and no `felt_too_long` spike (>25%)

If all three pass, classify **READY FOR T118 FLAGSHIP PACKAGING**.
If one fails, keep **NEEDS ONE TARGETED PATCH BEFORE T118**.
If two or more fail, classify **DEPTH/ONBOARDING STILL TOO WEAK**.

---

## Verification summary

- `events.ts` updated with T117A event names: ✓
- `track.ts` updated with T117A tracking APIs: ✓
- `DesobstrucaoPhysicsSlice.tsx` instrumented for primer/phase/session telemetry: ✓
- post-session qualitative feedback overlay added: ✓
- constraints respected (no new mechanics/tool/progression): ✓
- `npx tsc --noEmit`: ✓ (EXIT:0)
- `npm run test:e2e -- tests/e2e/desobstrucao-t116-proof.spec.ts`: ✓ (4/4 passed)
