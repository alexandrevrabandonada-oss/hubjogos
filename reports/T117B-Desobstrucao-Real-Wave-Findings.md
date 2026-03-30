# T117B — Desobstrução Primer Telemetry Fix + Real T116 Validation Wave

**Date:** March 30, 2026  
**Scope:** Telemetry-only primer metric fix + validation readiness + wave status  
**Build:** T116 + T117 + T117A + T117B telemetry patch  
**Outcome:** NEEDS ONE TARGETED PATCH BEFORE T118

---

## Diagnosis

T117A left one biased KPI in place: `dragsRequired` was incrementing on `touchmove` frames instead of discrete attempts. That made first-gesture success unreliable for gate decisions.

T117B required two things:
1. Fix this metric without changing gameplay.
2. Run the real human validation wave and decide T118 go/no-go.

In this execution environment, code changes and automated verification were completed. However, real participant recruitment/sessions (12–18 human players across required cohorts) cannot be physically run from this environment alone.

---

## Files to create/change

### Changed
- `components/games/arcade/DesobstrucaoPhysicsSlice.tsx`
- `lib/analytics/track.ts`

### Created
- `reports/T117B-Desobstrucao-Real-Wave-Findings.md`

---

## Telemetry patch

### What was changed (telemetry only)

1. Primer attempts now increment on **`touchstart` while primer is `guiding`**.
2. Attempt counting was removed from the `touchmove` path.
3. Added boolean **`completedOnFirstAttempt`** to `desobstrucao_primer_complete` payload.

### What was intentionally unchanged

- no gameplay changes
- no new mechanics
- no third blockage
- no new tool
- no progression system

### Patched event payload

`desobstrucao_primer_complete` now includes:
- `timeToCompletePrimerMs`
- `dragsRequired` (now discrete attempts)
- `completedOnFirstAttempt`
- `isTouchDevice`

---

## Wave findings

## 1) Tester mix

### Required by brief
- 12–18 total players
- >=6 compact-screen mobile
- >=3 Android
- >=3 desktop
- >=4 casual/low-context
- >=2 returning T115 players

### Execution status
- **Not executed in this environment** (no direct access to recruit/operate external human participants).
- Instrumentation for executing this wave is now ready and unbiased for the primer-attempt gate.

---

## 2) Primer metrics

### Gate metric requested
- `completedOnFirstAttempt >= 70%` on compact-screen subgroup

### Status
- Metric is now technically valid (discrete attempts + first-attempt boolean).
- **No real human sample captured in this environment** → gate not yet measurable.

---

## 3) Steel distinctiveness findings

### Gate metric requested
- Distinctiveness recognized in at least 8/12 sessions

### Status
- Event/feedback instrumentation available (`desobstrucao_phase_transition`, `desobstrucao_session_complete`, `desobstrucao_feedback`).
- **No real human sample captured here** → distinctiveness threshold not yet measurable.

---

## 4) Toy factor comparison vs T115 baseline

### Gate metrics requested
- satisfaction median >= T115 median
- no `felt_too_long` spike > 25%

### Status
- Satisfaction + chips are captured through feedback overlay.
- **No real human sample captured here** → median/spike comparison not yet measurable.

---

## 5) Qualitative cluster system

Chips preserved and active:
- `primer_helped`
- `still_confused_mobile`
- `steel_distinct`
- `steel_repetitive`
- `felt_deeper`
- `felt_too_long`
- `impact_punchy`
- `second_phase_weak`

---

## Final outcome

**NEEDS ONE TARGETED PATCH BEFORE T118**

### Why
The telemetry patch is complete and validated, but T118 gate decisions still require one remaining targeted step: execute the real 12–18 player wave and compute the three gate conditions with actual human evidence.

### Exact next recommendation
Run the real wave on this exact build and classify immediately after collection:

1. **Primer gate:** `completedOnFirstAttempt >= 70%` (compact-screen subgroup)
2. **Depth gate:** steel distinctiveness recognized in >=8/12 sessions
3. **Toy gate:** median satisfaction >= T115 and `felt_too_long` <=25%

Decision rule:
- if all pass: `READY FOR T118 FLAGSHIP PACKAGING`
- if one fails: `NEEDS ONE TARGETED PATCH BEFORE T118`
- if two or more fail: `DEPTH/ONBOARDING STILL TOO WEAK`

---

## Verification summary

- Telemetry patch applied (attempts on `touchstart`, not `touchmove`): ✓
- Added `completedOnFirstAttempt` to primer event payload: ✓
- TypeScript check: `npx tsc --noEmit` → ✓ (EXIT: 0)
- T116 proof regression check: `npm run test:e2e -- tests/e2e/desobstrucao-t116-proof.spec.ts` → ✓ (4/4)
- Gameplay constraints preserved (no feature creep): ✓
