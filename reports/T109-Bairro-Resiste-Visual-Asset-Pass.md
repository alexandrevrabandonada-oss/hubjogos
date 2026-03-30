# T109 - Bairro Resiste Visual Asset Pass + Recovery Spectacle

Date: 2026-03-30
Scope: Block identity, landmarks, sector distinction, recovery spectacle, screenshot power, mobile clarity

## Diagnosis
T108 improved readability and crisis flow, but the board still read as "system-first" in key moments:
- Block silhouettes were present but still soft in identity when seen at gameplay speed.
- Landmark feeling was weak at board level, so place memory was limited.
- Recovery moments had payoff, but lacked stronger relight/particle memory after stabilization.
- Screenshot power improved but remained short of a clear RTS-lite visual punch.

T109 focused on visual identity and recovery spectacle only, with no new gameplay mechanics.

## Files to Create/Change
Changed:
- components/games/arcade/BairroResisteArcadeGame.tsx
- components/games/arcade/BairroResisteArcadeGame.module.css
- public/arcade/bairro-resiste/entities/entity-hotspot-agua-v1.svg
- public/arcade/bairro-resiste/entities/entity-hotspot-saude-v1.svg
- public/arcade/bairro-resiste/entities/entity-hotspot-moradia-v1.svg
- public/arcade/bairro-resiste/entities/entity-hotspot-mobilidade-v1.svg
- tests/e2e/bairro-resiste-visual-pass.spec.ts

Created:
- reports/T109-Bairro-Resiste-Visual-Asset-Pass.md
- reports/t109-screenshots/01-calm-board.png
- reports/t109-screenshots/02-mid-pressure.png
- reports/t109-screenshots/03-critical-state.png
- reports/t109-screenshots/04-save-recovery.png

## Visual Asset Pass
1. Stronger custom silhouettes per block type
- Agua: stronger dual-tank utility silhouette with pipe grid + valve station cues.
- Saude: clearer clinic/health-post silhouette with totem sign + emergency bay reads.
- Moradia: denser stacked housing silhouette with layered roofline and neighborhood texture.
- Mobilidade: stronger terminal/corridor silhouette with overpass language and transit signal.

2. Real landmarks on board (non-mechanical props)
- Added landmark layer with fixed in-map props:
  - Caixa Dagua Torre Norte
  - Totem UBS Vale
  - Passarela do Corredor
  - Portico Terminal Popular
  - Praca do Morro
- Landmarks are visual-only and preserve current mechanics.

3. Increased sector distinction
- Added per-sector aura treatment around hotspots.
- Added per-type hotspot class treatment hooks for stronger identity separation.
- Kept pressure/crisis readability intact while increasing shape-language variance.

4. Mobile clarity guardrails
- On mobile, reduced extra visual noise:
  - hid secondary labels (landmark labels, saved memory tag, neighborhood labels)
  - hid density/infrastructure micro-markers
  - reduced landmark size/opacity
- Maintained large hotspot touch targets.

## Recovery Spectacle Pass
Upgraded stabilization feedback from simple glow to layered spectacle:
- Added recovery relight pulse (screen-like local relighting).
- Added particle burst layer for save impact.
- Kept flash and shockwave, now combined with stronger recovery stack.
- Added sustained "Setor Recuperado" memory tag after burst to improve temporal memory of successful saves.
- Added recovered-state styling distinct from immediate stabilized burst.

No mechanical behavior was changed (pressure model, timings, score logic remain intact).

## Screenshot Comparison
Captured with Playwright in real run flow:
- Calm board: reports/t109-screenshots/01-calm-board.png
- Mid-pressure: reports/t109-screenshots/02-mid-pressure.png
- Critical state: reports/t109-screenshots/03-critical-state.png
- Save/recovery: reports/t109-screenshots/04-save-recovery.png

Comparison notes:
- Calm: board now reads more like a place, with visible landmarks and stronger block silhouettes.
- Mid-pressure: highlighted block remains clear; sector cues are stronger without breaking readability.
- Critical: crisis silhouette is more legible and dramatic; hotspot identity remains readable under stress FX.
- Save/recovery: payoff is visibly improved via relight + particles + post-save memory state.

Honest gap still visible:
- Landmarks are now present and useful, but still not yet iconic enough to carry standout screenshot signature across all sectors.

## Status Recommendation
NEEDS_ONE_MORE_VISUAL_PASS

Reason:
- Major progress achieved on identity and recovery payoff.
- Board now reads closer to RTS-lite territory management in motion.
- But screenshot signature is still uneven; landmark/iconic composition should be pushed one more pass before FLAGSHIP_CANDIDATE.

## Verification Summary
Implemented and verified:
- Visual-only pass (no new mechanics).
- Updated hotspot assets and board landmark layer.
- Recovery spectacle upgraded with relight/particle/memory states.
- Mobile clarity protections applied.

Validation executed:
- Type check: npm run type-check (pass)
- Visual capture run: npm run test:e2e -- tests/e2e/bairro-resiste-visual-pass.spec.ts (pass)
- Screenshot set generated in reports/t109-screenshots
