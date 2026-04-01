# T122 Desobstrução Physics Engine Hardening

## Diagnosis
The runtime hangs detected during T120/T121 were symptomatic of a deeply coupled simulation loop. Cannon-es was forced to step at 60Hz regardless of the actual client's `requestAnimationFrame` timing. Whenever the browser tab was backgrounded, minimized, or suffered heavy CPU throttling, the wall-clock `Date.now()` continued ticking while the visual and physics state froze. Upon resuming, the delta caused instant timeout triggers or unresolvable desyncs where bodies were suspended but the UI believed it was in a flight timeout.

## Solutions Deployed
1. **Decoupled DeltaTime Accumulator**: 
   The `Cannon-es` engine now consumes a carefully bounded `deltaTime`. It caps the simulated delta at `0.1s` per frame to prevent the "spiral of death" when returning from background throttling.
2. **Tab Lifecycle Pause/Resume**: 
   Introduced `document.hidden` tracking. When the renderer pauses, the physics engine explicitly halts state progression and resets its internal clock timestamp (`lastTime`) on resume.
3. **Internal Game Clock**: 
   `Date.now()` is no longer used for timeout watchdogs. A local `flightTimeMs` engine clock accumulates solely when the physics engine is actively stepping.
4. **Desync Watchdogs**: 
   Added an explicit stuck-flight watchdog. If the rammer velocity falls below `0.1` after `1500ms` without triggering a collision event, the engine classifies the attempt as a visual glitch, safely despawns the projectile, and recovers the aiming phase.

## Failure Telemetry Added
We added explicit logging paths to map out real-world friction. If an edge case survives our fix, `trackDesobstrucaoFailure` will emit:
- `runtime_stuck`: Caught by the physics consistency watchdog.
- `flight_timeout`: Caught if the projectile escapes bounds or fails to trigger the `Out of Bounds` check.

## Test Matrix Simulation Results
| Scenario | Pre-T122 (T121) | Post-T122 |
|----------|-----------------|-----------|
| **Tab Backgrounded Mid-Flight** | Instant timeout / bodies left suspended. | Simulation pauses; gracefully resumes on focus. |
| **Heavy Mobile Throttle (30Hz)**| Game runs in 0.5x slow-motion. | Stepping accumulates delta; game runs at normal speed. |
| **Tab Hidden > 8 Seconds** | Projectile despawns; UI stays stuck in phase 2. | Engine preserves state; no failure triggered. |

## Final Technical Status
**PASS: SAFE FOR NEXT WAVE**
The Physics loop is fully resilient against standard browser lifecycle interference. The underlying fragility constraint is resolved.

## Recommendation
Return Desobstrução to the **Soft Public Rotation** and monitor the newly implemented telemetry. If `runtime_stuck` firing rates remain at virtually zero, the project can safely be cleared for a Flagship graduation.
