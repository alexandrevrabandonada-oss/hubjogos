# T116 — Desobstrucao Second Blockage Variant + Interactive Gesture Primer

**Date:** March 30, 2026  
**Scope:** Onboarding clarity + depth proof (single additional blockage only)  
**Status Recommendation:** READY FOR T116 USER VALIDATION

---

## Diagnosis

T115 full-wave already proved the lane works. T116 focuses on two scale risks only:

1. Mobile onboarding residual friction on compact screens.
2. Depth risk from having just one blockage.

This pass addresses both without retuning core physics or introducing new systems.

---

## Files to Create/Change

### Changed

- `components/games/arcade/DesobstrucaoPhysicsSlice.tsx`
- `components/games/arcade/DesobstrucaoPhysicsSlice.module.css`

### Added

- `lib/games/arcade/physics/steel-grate-barrier.ts`
- `tests/e2e/desobstrucao-t116-proof.spec.ts`

### Created report

- `reports/T116-Desobstrucao-Second-Blockage-Primer.md`

---

## Primer Implementation

The previous text-only hint was replaced by an interactive first-touch primer flow on touch devices.

### What changed

- Added primer states: `guiding -> success -> done`.
- Added guided swipe expectation before control unlock.
- Added progress feedback bar tied to actual drag movement.
- Added success acknowledgment state before full release.
- Added primer dismissal lock to avoid repeated onboarding noise.

### UX behavior

- Touch users see a compact onboarding card with animated drag cue.
- User must perform one valid gesture (rightward + upward drag envelope).
- System acknowledges completion and unlocks normal aiming.
- Desktop users skip primer entirely.

### Goal alignment

This directly targets the compact-screen confusion cases identified in T115 without adding secondary UI clutter to the normal loop.

---

## Second Blockage Implementation

A single second blockage variant was added: **Steel Grate**.

### Distinction from concrete barrier

- **Silhouette:** slatted vertical bars + horizontal braces, not a 4-block slab.
- **Break pattern:** segment snap behavior (nearest slat + optional side snaps), then cascading release.
- **Hit response:** lighter segment mass, stronger lateral bias, distinct break rhythm.
- **Reward feel:** concrete clear now transitions into steel phase; final restoration only after steel clear.

### Flow integration

- Phase 1 starts on concrete.
- On concrete clear, slice auto-swaps to steel with stage flash feedback.
- Player continues same short-session loop with same rammer tool.
- Restoration overlay and completion state trigger only after steel clear.

### Scope discipline

- Exactly one new blockage variant.
- No new tool.
- No progression system.
- No third blockage.

---

## What Stayed Untouched

The validated core was intentionally preserved:

- Gravity baseline unchanged.
- Rammer mass and arc identity unchanged.
- Audio stack unchanged (launch, impact, cascade, restoration).
- Haptic patterns unchanged.
- Core attempt loop and phase model unchanged.

---

## Capture Proof

Captured via Playwright proof spec using the live slice route.

### Evidence files

- `reports/t116-captures/primer-moment.png`
- `reports/t116-captures/blockage-1-impact.png`
- `reports/t116-captures/blockage-2-impact.png`
- `reports/t116-captures/second-blockage-clear.png`

### Capture notes

- Primer moment confirms interactive onboarding card is visible on touch setup.
- Blockage 1 impact confirms concrete phase still functions.
- Blockage 2 impact confirms steel phase is live and readable.
- Clear-state capture confirms final restoration state after second blockage flow.

---

## Status Recommendation

### READY FOR T116 USER VALIDATION

Rationale:

- Onboarding upgraded from passive text to active gesture learning.
- Depth proof added with one distinct second blockage.
- Core toy-factor foundation preserved.
- No scope creep into extra systems.
- Required proof captures produced.

This build is ready for a focused validation wave that tests:

1. Compact-screen first-contact comprehension with the new primer.
2. Replay lift from concrete -> steel contrast.
3. Session clarity and satisfaction across mobile and desktop.

---

## Verification Summary

- Interactive gesture primer implemented and integrated: ✅
- Primer success acknowledgment and control handoff: ✅
- Second blockage variant implemented (distinct behavior/silhouette): ✅
- Concrete -> steel transition in same slice loop: ✅
- Final clear state after second blockage: ✅
- Proof captures generated (4 required): ✅
- TypeScript check clean (`tsc --noEmit`): ✅
- Constraints respected (no third blockage, no new tool, no progression): ✅
