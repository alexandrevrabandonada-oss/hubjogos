# T110 - Bairro Resiste Signature Landmark Pass + Hero Composition

Date: 2026-03-30
Scope: iconic landmarks, hero composition, screenshot signature, mobile-safe clarity

## Diagnosis
T109 solved most of the generic board-read issues, but the board still lacked a clearly ownable screenshot signature. The remaining problem was not mechanical readability; it was composition.

Cold read before T110:
- Better blocks, better landmarks, better recovery.
- Still slightly flat as a full-board image.
- Landmarks existed, but did not yet dominate the frame strongly enough.
- The board looked improved, but not yet unmistakable at a glance.

T110 focused on composition and iconic hierarchy only, with no gameplay changes.

## Files to Create/Change
Changed:
- components/games/arcade/BairroResisteArcadeGame.tsx
- components/games/arcade/BairroResisteArcadeGame.module.css
- tests/e2e/bairro-resiste-signature-landmark.spec.ts

Created:
- reports/T110-Bairro-Resiste-Signature-Landmark-Pass.md
- reports/t110-screenshots/01-calm-board.png
- reports/t110-screenshots/02-mid-pressure.png
- reports/t110-screenshots/03-critical-state.png
- reports/t110-screenshots/04-save-recovery.png

## Signature Landmark Pass
1. Landmark iconicity increased
- Promoted key props into dominant anchors instead of small supporting map decorations.
- Added landmark prominence hierarchy: major anchors vs support props.
- Linked each landmark to a hotspot/sector identity so they read as part of local territory instead of floating decoration.

2. Landmark silhouette/readability improvements
- Water anchor now reads as a stronger tower silhouette.
- Mobility anchor now reads as a stronger terminal/arch silhouette.
- Moradia anchor now reads as a civic beacon/plaza marker.
- Health support prop remains legible but intentionally secondary to preserve balance.

3. Landmark relation to territory improved
- Added tether/accent logic so landmarks visually belong to surrounding block clusters.
- Increased scale and contrast of major landmarks.
- Improved placement so landmarks support the dominant gameplay lanes instead of sitting as isolated badges.

## Hero Composition Pass
1. Added territorial stage shapes
- Introduced board-level stage plates/corridors behind the key zones.
- Each hotspot area now sits on a stronger local visual base.
- This reduces flat-map feeling and creates a clearer territorial hierarchy.

2. Added active-sector hero focus
- Introduced a large composition halo around the active focal zone.
- Calm, warning, and critical states now read differently at the full-board level.
- This makes the key frame easier to parse in screenshots without changing mechanics.

3. Stronger board hierarchy
- Landmarks now sit above stage shapes.
- Hotspots remain the primary interactive read.
- Crisis and recovery effects now sit inside a clearer board-wide composition, so pressure and rescue moments photograph better.

4. Mobile clarity preserved
- Composition labels and heavier landmark support elements remain reduced/hidden on small screens.
- Touch targets and hotspot readability were not changed.
- No gameplay UI was made denser.

## Screenshot Comparison
Captured in real Playwright run:
- Calm board: reports/t110-screenshots/01-calm-board.png
- Mid-pressure: reports/t110-screenshots/02-mid-pressure.png
- Critical state: reports/t110-screenshots/03-critical-state.png
- Save/recovery: reports/t110-screenshots/04-save-recovery.png

Comparison notes:
- Calm board: improved structure and territorial staging; still the least dramatic frame, but no longer feels flat.
- Mid-pressure: stronger focal hierarchy; the board starts to read like a designed territorial scene rather than a neutral board.
- Critical state: now clearly poster-capable; crisis silhouette and stage contrast create a memorable frame.
- Save/recovery: strongest result together with critical; the rescue moment now has a real hero-frame quality.

Poster-worthiness judgment:
- Yes, there are now at least 1-2 truly poster-worthy frames.
- The strongest are critical-state and save/recovery.
- Calm board improved, but is still more restrained than the best dramatic frames.

## Status Recommendation
FLAGSHIP_CANDIDATE

Reason:
- The core blocker from T109 was iconic screenshot signature.
- T110 materially solves that for the strongest gameplay states.
- The board now has a more ownable territorial composition and a clearer visual identity in motion and in screenshots.

Important caveat:
- This is FLAGSHIP_CANDIDATE, not “fully maxed out.”
- The calm frame is still less iconic than the critical and recovery hero shots.
- But the project no longer needs another mandatory visual pass before being evaluated at flagship level.

## Verification Summary
Implemented and verified:
- No new mechanics added.
- Landmark hierarchy and board composition upgraded.
- Screenshot signature improved, especially in critical and recovery states.
- Mobile-safe reductions preserved.

Validation executed:
- Type check: npm run type-check (pass)
- Visual capture run: npm run test:e2e -- tests/e2e/bairro-resiste-signature-landmark.spec.ts (pass)
- Screenshot set generated in reports/t110-screenshots
