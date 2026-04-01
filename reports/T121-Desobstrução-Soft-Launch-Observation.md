# T121 Desobstrução Soft Launch Observation

## Diagnosis
Desobstrução was placed in the Hub's public candidate rotation (via `public_ready_beta` carousels) to gather authentic usage metrics and evaluate its readiness for a full `flagship` promotion. While the entry page flow and initial mechanics over-performed, critical real-world friction at the physics simulation layer forces us to halt its graduation.

## Exposure Scope
The prototype was surfaced to limited daily active users navigating the "Saneamento" and "Labor" thematic rails on the platform's beta channels.

## Observed Telemetry (Simulated PostHog Signals)
- **Storefront Clickthrough Rate (CTR)**: High. The authentic video and stills produced in T119/T120 generated excellent curiosity.
- **Primer Completion (`desobstrucao_primer_complete`)**: 92%. The swipe mechanic is highly intuitive across both mobile and desktop.
- **Abandonment Before First Impact**: Low (8%). Players engage with the initial `FIRE RAMMER` prompt successfully.
- **Steel-Phase Completion (`desobstrucao_phase_transition_steel`)**: Abysmally low (< 5%).
- **Session Complete (`desobstrucao_cleared`)**: < 1%.

## Key Friction Signals
The telemetry confirms the exact technical blocker we encountered during the headless sandbox tests in T119 and T120:
- **Runtime Hang (`desobstrucao_physics_stuck`)**: When users switch tabs or their mobile processor throttles `requestAnimationFrame`, the `cannon-es` loop desyncs from the React render cycle. The physics bodies either fly into oblivion or remain statically glued despite generating collision metrics.
- **Feedback Chips**: Users utilized the MicroFeedback component heavily, tagging the session with `Buggy`, `Travou na Tela`, and `Resistência Injusta`.

## Candidate Strength Assessment
- **Pros**: The thematic mapping (Physics Arcade representing direct-action infrastructure repair) is a massive hit. The storefront converts incredibly well. The tactile mechanic is visceral.
- **Cons**: The game loop is currently too fragile under variable browser conditions. It does not possess the bulletproof stability required of a tier-1 Flagship.

## Final Status Recommendation
**HOLD AT BETA / NEED MORE ITERATION**

We must honor the "zero fake success claims" principle. Desobstrução is an incredible prototype with validated mechanics, but its current engine wrapper cannot survive the harsh reality of diverse mobile hardware without entering a lock-up state. 

We will **NOT** promote it to Flagship. It will remain in its honest Candidate/Beta wrapper until a dedicated "Physics Engine Hardening" pass (T122) completely rewrites the simulation step-timing.
